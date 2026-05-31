const Response = require("../models/ResponseSchema");
const { fetchStudy, buildSnapshot } = require("../services/surveyService");
const axios = require('axios');

const PAYMENT_GATEWAY_URL = process.env.PAYMENT_GATEWAY_URL || 'http://gateway';

/**
 * POST /api/responses/draft
 * Create or update a draft (auto-save while filling form)
 */
exports.saveDraft = async (req, res) => {
  try {
    const { studyId, phaseId, answers } = req.body;
    const participantId = req.user.userId;

    if (!studyId || !phaseId) {
      return res.status(400).json({ message: "Missing studyId or phaseId" });
    }

    // Block if already submitted
    const submitted = await Response.findOne({
      studyId, phaseId, participantId, status: "SUBMITTED"
    });

    if (submitted) {
      return res.status(409).json({ message: "Phase already submitted, cannot save draft" });
    }

    // Upsert draft
    const draft = await Response.findOneAndUpdate(
      { studyId, phaseId, participantId, status: "DRAFT" },
      { $set: { answers: answers || [] } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: "Draft saved",
      data: draft
    });

  } catch (err) {
    return res.status(500).json({ message: "Error saving draft", error: err.message });
  }
};

/**
 * PATCH /api/responses/draft/answer
 * Save a single answer into the draft (per-question auto-save)
 */
exports.saveAnswer = async (req, res) => {
  try {
    const { studyId, phaseId, questionId, value } = req.body;
    const participantId = req.user.userId;

    if (!studyId || !phaseId || !questionId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const submitted = await Response.findOne({
      studyId, phaseId, participantId, status: "SUBMITTED"
    });

    if (submitted) {
      return res.status(409).json({ message: "Phase already submitted" });
    }

    // Upsert draft, then update or push the single answer
    const draft = await Response.findOneAndUpdate(
      { studyId, phaseId, participantId, status: "DRAFT" },
      {
        $set: { "answers.$[answer].value": value },
      },
      {
        arrayFilters: [{ "answer.questionId": questionId }],
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    // If answer didn't exist yet (arrayFilter matched nothing), push it
    if (!draft.answers.find(a => a.questionId === questionId)) {
      draft.answers.push({ questionId, value });
      await draft.save();
    }

    return res.status(200).json({
      message: "Answer saved",
      data: draft
    });

  } catch (err) {
    return res.status(500).json({ message: "Error saving answer", error: err.message });
  }
};

/**
 * POST /api/responses
 * Finalize and submit a response (upgrades draft → submitted)
 */
exports.submitResponse = async (req, res) => {
  try {
    const { studyId, phaseId, answers } = req.body;
    const participantId = req.user.userId;

    if (!studyId || !phaseId || !answers) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Block duplicate submission
    const alreadySubmitted = await Response.findOne({
      studyId, phaseId, participantId, status: "SUBMITTED"
    });

    if (alreadySubmitted) {
      return res.status(409).json({ message: "You already submitted this phase" });
    }

    // Fetch + validate study
    const study = await fetchStudy(studyId);
    const phase = study?.phases?.find(p => p.phaseId === phaseId);

    if (!phase) return res.status(404).json({ message: "Phase not found" });
    if (phase.status !== "ACTIVE") return res.status(400).json({ message: "Phase is not active" });

    const snapshot = buildSnapshot(phase);

    // ✅ Find existing draft and upgrade it, or create fresh submission
    const existing = await Response.findOne({
      studyId, phaseId, participantId, status: "DRAFT"
    });

    let response;

    if (existing) {
      // Upgrade draft → submitted
      existing.answers = answers;
      existing.snapshot = snapshot;
      existing.status = "SUBMITTED";
      existing.submittedAt = new Date();
      response = await existing.save();
    } else {
      // No draft — create fresh submission
      response = await Response.create({
        studyId,
        phaseId,
        participantId,
        answers,
        snapshot,
        status: "SUBMITTED",
        submittedAt: new Date()
      });
    }

const currentPhase = study.phases.find(p => p.phaseId === phaseId);
const rewardAmount = parseFloat(currentPhase.rewardAmount?.toString() || '0');

let rewardResponse;
try {
  rewardResponse = await axios.post(
    `${process.env.PAYMENT_SERVICE_URL}/api/points/reward`,
    {
      participantId: String(participantId),
      rewardAmount,
      studyId,
      phaseId
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.SERVICE_SECRET}`
      }
    }
  );
} catch (rewardErr) {
  console.error('REWARD ERROR:', rewardErr.response?.data || rewardErr.message);
  return res.status(500).json({
    message: "Response saved but reward failed",
    error: rewardErr.response?.data || rewardErr.message,
    data: response
  });
}

return res.status(201).json({
  message: "Response submitted successfully",
  data: response,
  reward: rewardResponse.data
});

  } catch (err) {
    return res.status(500).json({ message: "Error submitting response", error: err.message });
  }
};
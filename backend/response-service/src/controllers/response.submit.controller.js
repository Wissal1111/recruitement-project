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
exports.upsertSubmittedResponse = async (req, res) => {
  try {
    const participantId =
      req.user.userId || req.user.id || req.user.sub || req.user._id;

    const { studyId, phaseId } = req.params;
    const { answers } = req.body;

    if (!studyId || !phaseId) {
      return res.status(400).json({
        message: "studyId and phaseId are required",
      });
    }

    // Find the existing submitted response for this participant/phase
    const response = await Response.findOne({
      participantId,
      studyId,
      phaseId,
      status: "SUBMITTED",
    });

    if (!response) {
      return res.status(404).json({
        message: "Submitted response not found",
      });
    }

    // Update answers
    response.answers = Array.isArray(answers) ? answers : [];
    response.status = "SUBMITTED";
    response.submittedAt = new Date(); // update timestamp
    await response.save();

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      detail: error.message,
    });
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
    if (!["ACTIVE", "PENDING"].includes(phase.status)) return res.status(400).json({ message: "Phase is not active" });
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

// Helper: safely convert various Decimal128/string/number representations to Number
function toNumericAmount(val) {
  if (val == null) return 0;
  if (typeof val === 'number') return Number.isFinite(val) ? val : NaN;

  // Handle objects like { $numberDecimal: '5' } produced by some mongoose lean/transform ops
  if (typeof val === 'object') {
    if (val.$numberDecimal != null) {
      const n = Number(val.$numberDecimal);
      return Number.isFinite(n) ? n : NaN;
    }
    try {
      // Some Decimal128 instances implement toString() returning the numeric string
      if (typeof val.toString === 'function') {
        const s = val.toString();
        if (s && !/^\[object/.test(s)) {
          const cleaned = String(s).replace(/[^0-9.\-]/g, '');
          if (cleaned === '') return NaN;
          const n = Number(cleaned);
          return Number.isFinite(n) ? n : NaN;
        }
      }
    } catch (e) {
      return NaN;
    }
    return NaN;
  }

  try {
    const s = String(val);
    const cleaned = s.replace(/[^0-9.\-]/g, '');
    if (cleaned === '') return NaN;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  } catch (e) {
    return NaN;
  }
}

const rewardAmountRaw = currentPhase?.rewardAmount;
const rewardAmount = toNumericAmount(rewardAmountRaw);
console.debug('Raw phase.rewardAmount:', rewardAmountRaw, 'Parsed rewardAmount:', rewardAmount);

// If parsing failed or value is non-positive, skip reward to avoid sending NaN
if (!Number.isFinite(rewardAmount) || rewardAmount <= 0) {
  return res.status(201).json({
    message: "Response submitted successfully",
    data: response,
    reward: null
  });
}

let rewardResponse;
try {
  const rewardPayload = {
    participantId: String(participantId),
    rewardAmount,
    studyId,
    phaseId,
  };
  console.debug('Reward request payload:', rewardPayload);

  rewardResponse = await axios.post(
    `${process.env.PAYMENT_SERVICE_URL}/api/points/reward`,
    rewardPayload,
    {
      headers: {
        'Authorization': `Bearer ${process.env.SERVICE_SECRET}`,
        'x-creator-id': String(participantId),  // ← required by authMiddleware
        'Content-Type': 'application/json'
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
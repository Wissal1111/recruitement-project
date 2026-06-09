const Response = require("../models/ResponseSchema");
const { fetchStudy, buildSnapshot } = require("../services/surveyService");
const axios = require('axios');

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3050';
const SERVICE_SECRET = process.env.SERVICE_SECRET || 'internal_service_secret_key_2024';

// ✅ Helper to parse MongoDB Decimal128 rewardAmount safely
function parseRewardAmount(raw) {
  if (raw === null || raw === undefined) return 0;
  // MongoDB Decimal128 format: { $numberDecimal: "25" }
  if (typeof raw === 'object' && raw.$numberDecimal !== undefined) {
    return parseFloat(raw.$numberDecimal) || 0;
  }
  // Plain number
  if (typeof raw === 'number') return raw;
  // String
  if (typeof raw === 'string') return parseFloat(raw) || 0;
  return 0;
}

exports.saveDraft = async (req, res) => {
  try {
    const { studyId, phaseId, answers } = req.body;
    const participantId = req.user.userId;

    if (!studyId || !phaseId) {
      return res.status(400).json({ message: "Missing studyId or phaseId" });
    }

    const submitted = await Response.findOne({
      studyId, phaseId, participantId, status: "SUBMITTED"
    });

    if (submitted) {
      return res.status(409).json({
        message: "Phase already submitted, cannot save draft"
      });
    }

    const draft = await Response.findOneAndUpdate(
      { studyId, phaseId, participantId, status: "DRAFT" },
      { $set: { answers: answers || [] } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ message: "Draft saved", data: draft });

  } catch (err) {
    return res.status(500).json({
      message: "Error saving draft",
      error: err.message
    });
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

    response.answers = Array.isArray(answers) ? answers : [];
    response.status = "SUBMITTED";
    response.submittedAt = new Date();
    await response.save();

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      detail: error.message,
    });
  }
};

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

    const draft = await Response.findOneAndUpdate(
      { studyId, phaseId, participantId, status: "DRAFT" },
      { $set: { "answers.$[answer].value": value } },
      {
        arrayFilters: [{ "answer.questionId": questionId }],
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    if (!draft.answers.find(a => a.questionId === questionId)) {
      draft.answers.push({ questionId, value });
      await draft.save();
    }

    return res.status(200).json({ message: "Answer saved", data: draft });

  } catch (err) {
    return res.status(500).json({
      message: "Error saving answer",
      error: err.message
    });
  }
};

exports.submitResponse = async (req, res) => {
  try {
    const { studyId, phaseId, answers } = req.body;
    const participantId = req.user.userId;

    if (!studyId || !phaseId || !answers) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const alreadySubmitted = await Response.findOne({
      studyId, phaseId, participantId, status: "SUBMITTED"
    });

    if (alreadySubmitted) {
      return res.status(409).json({
        message: "You already submitted this phase"
      });
    }

    const study = await fetchStudy(studyId);
    const phase = study?.phases?.find(p => p.phaseId === phaseId);

    if (!phase) {
      return res.status(404).json({ message: "Phase not found" });
    }

    if (!["ACTIVE", "PENDING", "PUBLISHED"].includes(phase.status)) {
      return res.status(400).json({ message: "Phase is not active" });
    }

    const snapshot = buildSnapshot(phase);

    const existing = await Response.findOne({
      studyId, phaseId, participantId, status: "DRAFT"
    });

    let response;

    if (existing) {
      existing.answers = answers;
      existing.snapshot = snapshot;
      existing.status = "SUBMITTED";
      existing.submittedAt = new Date();
      response = await existing.save();
    } else {
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

<<<<<<< HEAD
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
=======
    // ✅ Parse rewardAmount correctly (handles MongoDB Decimal128 format)
    const currentPhase = study.phases.find(p => p.phaseId === phaseId);
    const rewardAmount = parseRewardAmount(currentPhase?.rewardAmount);

    console.log(`Phase ${phaseId} rewardAmount raw:`, currentPhase?.rewardAmount);
    console.log(`Phase ${phaseId} rewardAmount parsed:`, rewardAmount);

    if (rewardAmount > 0) {
      try {
        const rewardRes = await axios.post(
          `${PAYMENT_SERVICE_URL}/api/points/reward`,
          {
            participantId: String(participantId),
            rewardAmount,
            studyId,
            phaseId
          },
          {
            headers: {
              Authorization: `Bearer ${SERVICE_SECRET}`
            },
            timeout: 5000,
          }
        );
        console.log(
          '✅ Reward sent:',
          rewardAmount,
          'pts to participant:',
          participantId,
          '| result:',
          rewardRes.data
        );
      } catch (rewardErr) {
        console.error(
          'REWARD ERROR (non-fatal):',
          rewardErr.response?.data || rewardErr.message
        );
>>>>>>> d66ee48 (last commit)
      }
    } else {
      console.log('Phase reward is 0 — skipping reward for phase:', phaseId);
    }

    return res.status(201).json({
      message: "Response submitted successfully",
      data: response,
    });

  } catch (err) {
    console.error('submitResponse error:', err.message);
    return res.status(500).json({
      message: "Error submitting response",
      error: err.message
    });
  }
};

exports.getMyResponsesGroupedByStudy = async (req, res) => {
  try {
    const participantId = req.user.userId;
    const responses = await Response.find({ participantId })
      .sort({ submittedAt: -1 });

    const grouped = {};
    for (const r of responses) {
      if (!grouped[r.studyId]) {
        grouped[r.studyId] = { studyId: r.studyId, responses: [] };
      }
      grouped[r.studyId].responses.push(r);
    }

    return res.json({ data: Object.values(grouped) });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching responses",
      error: err.message
    });
  }
};

exports.getMyResponses = async (req, res) => {
  try {
    const participantId = req.user.userId;
    const responses = await Response.find({ participantId })
      .sort({ submittedAt: -1 });
    return res.json(responses);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching responses",
      error: err.message
    });
  }
};

exports.getMySubmitted = async (req, res) => {
  try {
    const participantId = req.user.userId;
    const responses = await Response.find({
      participantId,
      status: "SUBMITTED"
    }).sort({ submittedAt: -1 });
    return res.json(responses);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching submitted responses",
      error: err.message
    });
  }
};

exports.getMyDrafts = async (req, res) => {
  try {
    const participantId = req.user.userId;
    const drafts = await Response.find({
      participantId,
      status: "DRAFT"
    }).sort({ updatedAt: -1 });
    return res.json(drafts);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching drafts",
      error: err.message
    });
  }
};

exports.getMyDraftsGroupedByStudy = async (req, res) => {
  try {
    const participantId = req.user.userId;
    const drafts = await Response.find({
      participantId,
      status: "DRAFT"
    }).sort({ updatedAt: -1 });

    const grouped = {};
    for (const d of drafts) {
      if (!grouped[d.studyId]) {
        grouped[d.studyId] = { studyId: d.studyId, drafts: [] };
      }
      grouped[d.studyId].drafts.push(d);
    }

    return res.json({ data: Object.values(grouped) });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching drafts",
      error: err.message
    });
  }
};

exports.getMyDraftsByStudyId = async (req, res) => {
  try {
    const participantId = req.user.userId;
    const { studyId } = req.params;
    const drafts = await Response.find({
      participantId,
      studyId,
      status: "DRAFT"
    });
    return res.json(drafts);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching drafts",
      error: err.message
    });
  }
};

exports.getMyDraftsByStudyAndPhaseId = async (req, res) => {
  try {
    const participantId = req.user.userId;
    const { studyId, phaseId } = req.params;
    const draft = await Response.findOne({
      participantId,
      studyId,
      phaseId,
      status: "DRAFT"
    });
    return res.json(draft || null);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching draft",
      error: err.message
    });
  }
};

exports.getMyDraftById = async (req, res) => {
  try {
    const participantId = req.user.userId;
    const { responseId } = req.params;
    const draft = await Response.findOne({
      _id: responseId,
      participantId,
      status: "DRAFT"
    });
    if (!draft) {
      return res.status(404).json({ message: "Draft not found" });
    }
    return res.json(draft);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching draft",
      error: err.message
    });
  }
};

exports.getResponsesByStudy = async (req, res) => {
  try {
    const { studyId } = req.params;
    const responses = await Response.find({
      studyId,
      status: "SUBMITTED"
    }).sort({ submittedAt: -1 });
    return res.json(responses);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching responses",
      error: err.message
    });
  }
};

exports.getResponsesByPhase = async (req, res) => {
  try {
    const { studyId, phaseId } = req.params;
    const responses = await Response.find({
      studyId,
      phaseId,
      status: "SUBMITTED"
    }).sort({ submittedAt: -1 });
    return res.json(responses);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching responses",
      error: err.message
    });
  }
};

exports.getResponsesByParticipant = async (req, res) => {
  try {
    const { participantId } = req.params;
    const responses = await Response.find({
      participantId,
      status: "SUBMITTED"
    }).sort({ submittedAt: -1 });
    return res.json(responses);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching responses",
      error: err.message
    });
  }
};

exports.getResponseById = async (req, res) => {
  try {
    const participantId = req.user.userId;
    const { responseId } = req.params;
    const response = await Response.findOne({
      _id: responseId,
      participantId
    });
    if (!response) {
      return res.status(404).json({ message: "Response not found" });
    }
    return res.json(response);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching response",
      error: err.message
    });
  }
};

exports.deleteResponse = async (req, res) => {
  try {
    const participantId = req.user.userId;
    const { responseId } = req.params;
    const response = await Response.findOne({
      _id: responseId,
      participantId,
      status: "DRAFT"
    });
    if (!response) {
      return res.status(404).json({
        message: "Draft not found or already submitted"
      });
    }
    await Response.deleteOne({ _id: responseId });
    return res.json({ message: "Draft deleted successfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Error deleting response",
      error: err.message
    });
  }
};

exports.getStudyAnalytics = async (req, res) => {
  try {
    const { studyId } = req.params;
    const responses = await Response.find({
      studyId,
      status: "SUBMITTED"
    });

    const analytics = {};
    for (const response of responses) {
      for (const answer of response.answers) {
        const qId = answer.questionId;
        if (!analytics[qId]) {
          analytics[qId] = { questionId: qId, answers: [], count: 0 };
        }
        analytics[qId].answers.push(answer.value);
        analytics[qId].count++;
      }
    }

    return res.json({
      studyId,
      totalResponses: responses.length,
      analytics: Object.values(analytics)
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching analytics",
      error: err.message
    });
  }
};

exports.getStudyStats = async (req, res) => {
  try {
    const { studyId } = req.params;

    const total = await Response.countDocuments({ studyId });
    const submitted = await Response.countDocuments({
      studyId,
      status: "SUBMITTED"
    });
    const drafts = await Response.countDocuments({
      studyId,
      status: "DRAFT"
    });

    const byPhase = await Response.aggregate([
      { $match: { studyId, status: "SUBMITTED" } },
      { $group: { _id: "$phaseId", count: { $sum: 1 } } }
    ]);

    return res.json({
      studyId,
      total,
      submitted,
      drafts,
      byPhase
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching stats",
      error: err.message
    });
  }
};
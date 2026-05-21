const Response = require("../models/ResponseSchema");

exports.getMyResponses = async (req, res) => {
  try {
    const participantId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status; // optional filter: DRAFT | SUBMITTED

    const filter = { participantId };
    if (status) filter.status = status;

    const [responses, count] = await Promise.all([
      Response.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Response.countDocuments(filter)
    ]);

    return res.json({
      count,
      page,
      totalPages: Math.ceil(count / limit),
      data: responses
    });

  } catch (err) {
    return res.status(500).json({ message: "Error fetching responses", error: err.message });
  }
};
exports.getMyResponsesGroupedByStudy = async (req, res) => {
  try {
    const participantId = req.user.userId;
    const status = req.query.status;

    const match = { participantId };
    if (status) match.status = status;

    const grouped = await Response.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$studyId",
          responses: { $push: "$$ROOT" }
        }
      },
      {
        $project: {
          _id: 0,
          studyId: "$_id",
          responses: 1
        }
      }
    ]);

    return res.json({
      count: grouped.length,
      data: grouped
    });

  } catch (err) {
    return res.status(500).json({ message: "Error fetching responses", error: err.message });
  }
};
exports.getResponseById = async (req, res) => {
  try {
    const { responseId } = req.params;
    const participantId = req.user.userId;

    const response = await Response.findOne({ responseId, participantId });

    if (!response) return res.status(404).json({ message: "Response not found" });

    return res.json(response);

  } catch (err) {
    return res.status(500).json({ message: "Error fetching response", error: err.message });
  }
};

exports.getResponsesByStudy = async (req, res) => {
  try {
    const { studyId } = req.params;
    const status = req.query.status;

    const filter = { studyId };
    if (status) filter.status = status;

    const responses = await Response.find(filter).sort({ createdAt: -1 });

    return res.json({ count: responses.length, data: responses });

  } catch (err) {
    return res.status(500).json({ message: "Error fetching responses", error: err.message });
  }
};

exports.getResponsesByPhase = async (req, res) => {
  try {
    const { studyId, phaseId } = req.params;
    const status = req.query.status;

    const filter = { studyId, phaseId };
    if (status) filter.status = status;

    const responses = await Response.find(filter).sort({ createdAt: -1 });

    return res.json({ count: responses.length, data: responses });

  } catch (err) {
    return res.status(500).json({ message: "Error fetching responses", error: err.message });
  }
};

exports.getResponsesByParticipant = async (req, res) => {
  try {
    const { participantId } = req.params;
    const status = req.query.status;

    // 1. Fetch creator's studies by forwarding their token
    const { data } = await axios.get(
      `${process.env.SURVEY_SERVICE_URL}/studies/my-studies`,
      {
        headers: { Authorization: req.headers.authorization },
        timeout: 5000
      }
    );

    const creatorStudyIds = data.studies.map(s => s.studyId);

    if (creatorStudyIds.length === 0) {
      return res.json({ count: 0, data: [] });
    }

    // 2. Get responses for this participant only within creator's studies
    const filter = {
      participantId,
      studyId: { $in: creatorStudyIds }
    };
    if (status) filter.status = status;

    const grouped = await Response.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$studyId",
          phases: {
            $push: {
              phaseId: "$phaseId",
              status: "$status",
              submittedAt: "$submittedAt",
              answers: "$answers",
              snapshot: "$snapshot"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          studyId: "$_id",
          phases: 1
        }
      }
    ]);

    return res.json({ count: grouped.length, data: grouped });

  } catch (err) {
    return res.status(500).json({ message: "Error fetching responses", error: err.message });
  }
};
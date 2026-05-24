const axios = require("axios");

module.exports = async (req, res, next) => {
  try {
    const studyId = req.params.studyId;

    if (!studyId) return res.status(400).json({ message: "Missing studyId" });

    const { data: study } = await axios.get(
      `${process.env.SURVEY_SERVICE_URL}/studies/extern/${studyId}`,
      { timeout: 5000 }
    );

    if (study.creatorId !== req.user.userId) {
      return res.status(403).json({ message: "Access denied: not the study creator" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: "Could not verify study ownership" });
  }
};
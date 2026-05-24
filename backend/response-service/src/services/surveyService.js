const axios = require("axios");

exports.fetchStudy = async (studyId) => {
  const url = `${process.env.SURVEY_SERVICE_URL}/studies/extern/${studyId}`;
  try {
    const { data } = await axios.get(url, { timeout: 5000 });
    return data;
  } catch (err) {
    throw new Error("Failed to fetch study from survey service");
  }
};

exports.buildSnapshot = (phase) => ({
  phaseId: phase.phaseId,
  phaseTitle: phase.title,
  phaseOrder: phase.phaseOrder,
  questions: (phase.questions || []).map(q => ({
    questionId: q.questionId,
    text: q.text,
    questionType: q.questionType,
    isRequired: q.isRequired,
    options: q.options || []
  }))
});
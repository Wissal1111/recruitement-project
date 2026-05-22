const Response = require("../models/ResponseSchema");

//stats for a study (total responses, submitted vs drafts, per phase breakdown)
exports.getStudyStats = async (req, res) => {
  try {
    const { studyId } = req.params;

    const stats = await Response.aggregate([
      {
        $match: { studyId }
      },

      {
        $facet: {

          overview: [
            {
              $group: {
                _id: null,
                totalResponses: { $sum: 1 },

                submitted: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "SUBMITTED"] }, 1, 0]
                  }
                },

                drafts: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "DRAFT"] }, 1, 0]
                  }
                }
              }
            }
          ],

          perPhase: [
            {
              $group: {
                _id: "$phaseId",

                totalResponses: { $sum: 1 },

                submitted: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "SUBMITTED"] }, 1, 0]
                  }
                },

                drafts: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "DRAFT"] }, 1, 0]
                  }
                }
              }
            },

            {
              $project: {
                _id: 0,
                phaseId: "$_id",
                totalResponses: 1,
                submitted: 1,
                drafts: 1
              }
            }
          ]
        }
      }
    ]);

    const overview = stats[0].overview[0] || {
      totalResponses: 0,
      submitted: 0,
      drafts: 0
    };

    return res.json({
      studyId,
      ...overview,
      perPhase: stats[0].perPhase
    });

  } catch (err) {
    return res.status(500).json({
      message: "Error fetching study stats",
      error: err.message
    });
  }
};

// detailed analytics for a study (answer distributions per question, etc.)
exports.getStudyAnalytics = async (req, res) => {
  try {
    const { studyId } = req.params;

    const responses = await Response.find({
      studyId,
      status: "SUBMITTED"
    }).lean();

    if (responses.length === 0) {
      return res.json({
        studyId,
        completionRate: 0,
        totalSubmitted: 0,
        questionAnalytics: []
      });
    }

    // -----------------------------
    // GLOBAL STATS
    // -----------------------------
    const totalSubmitted = responses.length;

    // -----------------------------
    // QUESTION ANALYTICS
    // -----------------------------
    const questionMap = {};

    responses.forEach(response => {

      response.answers.forEach(answer => {

        const questionSnapshot = response.snapshot.questions.find(
          q => q.questionId === answer.questionId
        );

        if (!questionSnapshot) return;

        const qId = answer.questionId;

        if (!questionMap[qId]) {
          questionMap[qId] = {
            questionId: qId,
            questionText: questionSnapshot.text,
            questionType: questionSnapshot.questionType,
            totalAnswers: 0,
            distribution: {}
          };
        }

        questionMap[qId].totalAnswers++;

        // MULTIPLE CHOICE ARRAY
        if (Array.isArray(answer.value)) {

          answer.value.forEach(v => {
            questionMap[qId].distribution[v] =
              (questionMap[qId].distribution[v] || 0) + 1;
          });

        }

        // SINGLE VALUE
        else {

          const value = String(answer.value);

          questionMap[qId].distribution[value] =
            (questionMap[qId].distribution[value] || 0) + 1;
        }

      });

    });

    return res.json({
      studyId,
      totalSubmitted,

      questionAnalytics: Object.values(questionMap)
    });

  } catch (err) {

    return res.status(500).json({
      message: "Error fetching analytics",
      error: err.message
    });

  }
};
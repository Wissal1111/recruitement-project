const { Study } = require('../models');

// This function is designed for inter-service communication (e.g., Participant Service)
// It returns only the structure of the study needed for a participant to take part.
exports.getStudyStructureForParticipant = async (req, res) => {
  try {
    const { studyId } = req.params;

    // Find the study and select only the fields relevant to a participant
    // We exclude administrative fields like creatorId, totalBudget, etc.
    const study = await Study.findOne({ studyId })
      .select('title description studyCategory phases studyStatus')
      .lean();

    if (!study) {
      return res.status(404).json({
        message: "Error: Study not found."
      });
    }

    // Only allow participants to access ACTIVE or PUBLISHED studies
    if (study.studyStatus !== 'ACTIVE' && study.studyStatus !== 'PUBLISHED') {
      return res.status(403).json({
        message: "Error: This study is not currently active for participants."
      });
    }

    // After checking the status, we can remove it from the final response
    delete study.studyStatus;

    res.status(200).json(study);
  } catch (error) {
    console.error("Error fetching study structure for participant:", error);
    res.status(500).json({
      message: "Server error while fetching study structure",
      error: error.message
    });
  }
};

// Validates if a participant can access a specific phase
// This is used by the Participant Service when a user starts a phase
exports.validatePhaseAccess = async (req, res) => {
  try {
    const { studyId, phaseId } = req.params;

    // 1. Find the study and specifically the requested phase
    const study = await Study.findOne({ studyId }).select('studyStatus phases').lean();

    if (!study) {
      return res.status(404).json({ message: "Error: Study not found." });
    }

    // 2. Check global study status
    if (study.studyStatus !== 'ACTIVE') {
      return res.status(403).json({ message: "Error: This study is not currently active." });
    }

    // 3. Find the specific phase
    const phase = study.phases.find(p => p.phaseId === phaseId);

    if (!phase) {
      return res.status(404).json({ message: "Error: Phase not found in this study." });
    }

    // 4. Check phase status
    if (phase.status !== 'ACTIVE') {
      return res.status(403).json({ message: "Error: This phase is not active for participation." });
    }

    // 5. Success: Return minimal phase info for confirmation
    res.status(200).json({
      accessGranted: true,
      phaseId: phase.phaseId,
      phaseType: phase.phaseType,
      rewardAmount: phase.rewardAmount
    });

  } catch (error) {
    console.error("Error validating phase access:", error);
    res.status(500).json({
      message: "Server error during phase validation",
      error: error.message
    });
  }
};

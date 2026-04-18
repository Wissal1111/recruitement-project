const { Study } = require('../models');

exports.createStudy = async (req, res) => {
  try {
    // 1. Extract data from request body
    const {
      title,
      description,
      totalBudget,
      studyCategory,
      phases,
      startDate,
      endDate
    } = req.body;

    // Get creatorId from token (added by authMiddleware)
    // Checking for common ID field names (userId, id, sub, _id)
    const creatorId = req.user.userId || req.user.id || req.user.sub || req.user._id; 

    if (!creatorId) {
      return res.status(401).json({
        message: "Authentication error: User ID not found in token."
      });
    }

    // 2. Validate that phases exist
    if (!phases || !Array.isArray(phases) || phases.length === 0) {
      return res.status(400).json({
        message: "Error: Study must contain at least one phase."
      });
    }

    // 3. Budget calculation logic
    let calculatedTotal = 0;
    phases.forEach((phase, index) => {
      const phaseCost = (parseFloat(phase.rewardAmount) || 0) * (parseInt(phase.maxParticipants) || 0);
      calculatedTotal += phaseCost;

      // Automatically add phase order if not provided by front-end
      if (!phase.phaseOrder) {
        phase.phaseOrder = index + 1;
      }
    });

    if (calculatedTotal > parseFloat(totalBudget)) {
      return res.status(400).json({
        message: `Insufficient budget. Required total (${calculatedTotal}) is greater than the specified budget (${totalBudget}).`
      });
    }

    // 4. Create document and save to MongoDB
    const newStudy = new Study({
      title,
      description,
      totalBudget,
      studyCategory, // Mapping category to studyCategory from schema
      creatorId,
      phases,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      studyStatus: 'DRAFT'
    });

    const savedStudy = await newStudy.save();

    // 5. Success response
    res.status(201).json({
      message: "Study created successfully!",
      studyId: savedStudy.studyId,
      study: savedStudy
    });

  } catch (error) {
    console.error("Error creating study:", error);
    res.status(500).json({
      message: "Server error during creation",
      error: error.message
    });
  }
};

// Get all studies by a specific creator (from token)
exports.getStudiesByCreator = async (req, res) => {
  try {
    // creatorId is now taken from req.user (the token)
    const creatorId = req.user.userId || req.user.id || req.user.sub || req.user._id; 

    if (!creatorId) {
      return res.status(401).json({
        message: "Authentication error: User ID not found in token."
      });
    }

    // Find all studies where creatorId matches
    const studies = await Study.find({ creatorId });

    res.status(200).json({
      count: studies.length,
      studies: studies
    });
  } catch (error) {
    console.error("Error fetching creator studies:", error);
    res.status(500).json({
      message: "Server error while fetching studies",
      error: error.message
    });
  }
};

// Get a single study by its studyId
exports.getStudyById = async (req, res) => {
  try {
    const { studyId } = req.params;

    // Find study by studyId (our custom UUID)
    const study = await Study.findOne({ studyId });

    if (!study) {
      return res.status(404).json({
        message: "Error: Study not found."
      });
    }

    res.status(200).json(study);
  } catch (error) {
    console.error("Error fetching study by ID:", error);
    res.status(500).json({
      message: "Server error while fetching study",
      error: error.message
    });
  }
};

// Delete a study by its studyId (Owner only)
exports.deleteStudy = async (req, res) => {
  try {
    const { studyId } = req.params;
    const creatorId = req.user.userId || req.user.id || req.user.sub || req.user._id;

    // Find study first to check ownership
    const study = await Study.findOne({ studyId });

    if (!study) {
      return res.status(404).json({
        message: "Error: Study not found."
      });
    }

    // Security check: Only the creator can delete their study
    if (study.creatorId !== creatorId) {
      return res.status(403).json({
        message: "Access denied: You are not authorized to delete this study."
      });
    }

    // Perform deletion
    await Study.deleteOne({ studyId });

    res.status(200).json({
      message: "Study deleted successfully!"
    });
  } catch (error) {
    console.error("Error deleting study:", error);
    res.status(500).json({
      message: "Server error during study deletion",
      error: error.message
    });
  }
};

// Update Study Status (e.g., DRAFT -> PUBLISHED)
exports.updateStudyStatus = async (req, res) => {
  try {
    const { studyId } = req.params;
    const { status } = req.body;
    const creatorId = req.user.userId || req.user.id || req.user.sub || req.user._id;

    const study = await Study.findOne({ studyId });
    if (!study) return res.status(404).json({ message: "Study not found" });
    if (study.creatorId !== creatorId) return res.status(403).json({ message: "Not authorized" });

    study.studyStatus = status;
    await study.save();

    res.status(200).json({ message: "Study status updated", study });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};

// Update a specific phase within a study
exports.updatePhase = async (req, res) => {
  try {
    const { studyId, phaseId } = req.params;
    const updateData = req.body;
    const creatorId = req.user.userId || req.user.id || req.user.sub || req.user._id;

    const study = await Study.findOne({ studyId });
    if (!study) return res.status(404).json({ message: "Study not found" });
    if (study.creatorId !== creatorId) return res.status(403).json({ message: "Not authorized" });

    const phase = study.phases.find(p => p.phaseId === phaseId);
    if (!phase) return res.status(404).json({ message: "Phase not found" });

    // Update phase fields
    Object.assign(phase, updateData);
    await study.save();

    res.status(200).json({ message: "Phase updated", study });
  } catch (error) {
    res.status(500).json({ message: "Error updating phase", error: error.message });
  }
};

// Add a question to a specific form within a phase
exports.addQuestionToForm = async (req, res) => {
  try {
    const { studyId, phaseId } = req.params;
    const questionData = req.body;
    const creatorId = req.user.userId || req.user.id || req.user.sub || req.user._id;

    const study = await Study.findOne({ studyId });
    if (!study) return res.status(404).json({ message: "Study not found" });
    if (study.creatorId !== creatorId) return res.status(403).json({ message: "Not authorized" });

    const phase = study.phases.find(p => p.phaseId === phaseId);
    if (!phase || !phase.form) return res.status(404).json({ message: "Phase or Form not found" });

    phase.form.questions.push(questionData);
    await study.save();

    res.status(201).json({ message: "Question added", study });
  } catch (error) {
    res.status(500).json({ message: "Error adding question", error: error.message });
  }
};

// Remove a question from a form
exports.removeQuestion = async (req, res) => {
  try {
    const { studyId, phaseId, questionId } = req.params;
    const creatorId = req.user.userId || req.user.id || req.user.sub || req.user._id;

    const study = await Study.findOne({ studyId });
    if (!study) return res.status(404).json({ message: "Study not found" });
    if (study.creatorId !== creatorId) return res.status(403).json({ message: "Not authorized" });

    const phase = study.phases.find(p => p.phaseId === phaseId);
    if (!phase || !phase.form) return res.status(404).json({ message: "Phase or Form not found" });

    phase.form.questions = phase.form.questions.filter(q => q.questionId !== questionId);
    await study.save();

    res.status(200).json({ message: "Question removed", study });
  } catch (error) {
    res.status(500).json({ message: "Error removing question", error: error.message });
  }
};
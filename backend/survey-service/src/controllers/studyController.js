const { Study } = require('../models');

//linked
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
      endDate,
      isMultiPhase
    } = req.body;

    const defaultPhase = {
      phaseOrder: 1,
      title: ' ',
      description: '',
      phaseType: 'NORMAL',
      rewardAmount: 0,
      maxParticipants: 0,
      status: 'PENDING',
      questions: [
        {
          text: ' ',
          questionType: 'TEXT',
          isRequired: false,
          orderIndex: 1,
          options: []
        }
      ]
    };
    const defaultQuestion = {
      text: ' ',
      questionType: 'TEXT',
      isRequired: false,
      orderIndex: 1,
      options: []
    };

    // Get creatorId from token (added by authMiddleware)
    // Checking for common ID field names (userId, id, sub, _id)
    const creatorId = req.user.userId || req.user.id || req.user.sub || req.user._id; 

    if (!creatorId) {
      return res.status(401).json({
        message: "Authentication error: User ID not found in token."
      });
    }

    // 2. If no phases are provided, create one default empty phase with one empty TEXT question
    const preparedPhases = Array.isArray(phases) && phases.length > 0 ? phases : [defaultPhase];

    // Ensure each phase has at least one question
    preparedPhases.forEach((phase) => {
      if (!Array.isArray(phase.questions) || phase.questions.length === 0) {
        phase.questions = [{ ...defaultQuestion }];
      }
    });

    // 3. Budget calculation logic
    let calculatedTotal = 0;
    preparedPhases.forEach((phase, index) => {
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
      phases: preparedPhases,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      studyStatus: 'DRAFT',
      isMultiPhase
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
//linked
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
//linked
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


// Update a study (survey) by studyId (Owner only)
exports.updateStudy = async (req, res) => {
  try {
    const { studyId } = req.params;
    const updateData = req.body || {};
    const creatorId = req.user.userId || req.user.id || req.user.sub || req.user._id;

    const study = await Study.findOne({ studyId });
    if (!study) {
      return res.status(404).json({ message: "Study not found" });
    }
    if (study.creatorId !== creatorId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const defaultQuestion = {
      text: ' ',
      questionType: 'TEXT',
      isRequired: false,
      orderIndex: 1,
      options: []
    };

    const defaultPhase = {
      phaseOrder: 1,
      title: ' ',
      description: '',
      phaseType: 'NORMAL',
      rewardAmount: 0,
      maxParticipants: 0,
      status: 'PENDING',
      questions: [{ ...defaultQuestion }]
    };

    const hasPhasesInPayload = Array.isArray(updateData.phases);
    const nextPhases = hasPhasesInPayload
      ? (updateData.phases.length > 0 ? updateData.phases : [defaultPhase])
      : study.phases;

    nextPhases.forEach((phase, index) => {
      if (!phase.phaseOrder) {
        phase.phaseOrder = index + 1;
      }
      if (!Array.isArray(phase.questions) || phase.questions.length === 0) {
        phase.questions = [{ ...defaultQuestion }];
      }
    });

    const effectiveTotalBudget = updateData.totalBudget !== undefined
      ? parseFloat(updateData.totalBudget)
      : parseFloat(study.totalBudget);

    let calculatedTotal = 0;
    nextPhases.forEach((phase) => {
      const phaseCost = (parseFloat(phase.rewardAmount) || 0) * (parseInt(phase.maxParticipants) || 0);
      calculatedTotal += phaseCost;
    });

    if (calculatedTotal > effectiveTotalBudget) {
      return res.status(400).json({
        message: `Insufficient budget. Required total (${calculatedTotal}) is greater than the specified budget (${effectiveTotalBudget}).`
      });
    }

    const allowedFields = ['title', 'description', 'totalBudget', 'studyCategory', 'startDate', 'endDate', 'studyStatus'];
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        study[field] = updateData[field];
      }
    });

    if (hasPhasesInPayload) {
      study.phases = nextPhases;
    }

    const updatedStudy = await study.save();

    res.status(200).json({
      message: "Study updated successfully",
      study: updatedStudy
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating study", error: error.message });
  }
};

//linked
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
    const  status  = 'PUBLISHED';
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

//linked
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

//linked
// Add a new phase to an existing study
exports.addPhase = async (req, res) => {
  try {
    const { studyId } = req.params;
    const phaseData = req.body || {};
    const creatorId = req.user.userId || req.user.id || req.user.sub || req.user._id;

    const study = await Study.findOne({ studyId });
    if (!study) return res.status(404).json({ message: "Study not found" });
    if (study.creatorId !== creatorId) return res.status(403).json({ message: "Not authorized" });

    const defaultQuestion = {
      text: ' ',
      questionType: 'TEXT',
      isRequired: false,
      orderIndex: 1,
      options: []
    };

    const nextPhaseOrder = study.phases.length + 1;
    const newPhase = {
      phaseOrder: phaseData.phaseOrder || nextPhaseOrder,
      title: phaseData.title || ' ',
      description: phaseData.description || '',
      phaseType: phaseData.phaseType || 'NORMAL',
      rewardAmount: phaseData.rewardAmount ?? 0,
      maxParticipants: phaseData.maxParticipants ?? 0,
      status: phaseData.status || 'PENDING',
      questions: Array.isArray(phaseData.questions) && phaseData.questions.length > 0
        ? phaseData.questions
        : [{ ...defaultQuestion }]
    };

    study.phases.push(newPhase);
    study.phases.sort((a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0));
    study.phases.forEach((phase, index) => {
      phase.phaseOrder = index + 1;
    });

    await study.save();

    res.status(201).json({ message: "Phase added", study });
  } catch (error) {
    res.status(500).json({ message: "Error adding phase", error: error.message });
  }
};

//linked
// Delete a phase from an existing study
exports.deletePhase = async (req, res) => {
  try {
    const { studyId, phaseId } = req.params;
    const creatorId = req.user.userId || req.user.id || req.user.sub || req.user._id;

    const study = await Study.findOne({ studyId });
    if (!study) return res.status(404).json({ message: "Study not found" });
    if (study.creatorId !== creatorId) return res.status(403).json({ message: "Not authorized" });

    const initialCount = study.phases.length;
    study.phases = study.phases.filter((phase) => phase.phaseId !== phaseId);
    if (study.phases.length === initialCount) {
      return res.status(404).json({ message: "Phase not found" });
    }

    study.phases.forEach((phase, index) => {
      phase.phaseOrder = index + 1;
    });

    await study.save();

    res.status(200).json({ message: "Phase deleted", study });
  } catch (error) {
    res.status(500).json({ message: "Error deleting phase", error: error.message });
  }
};

//linked
// Add a question to a specific phase
exports.addQuestionToPhase = async (req, res) => {
  try {
    const { studyId, phaseId } = req.params;
    const questionData = req.body;
    const creatorId = req.user.userId || req.user.id || req.user.sub || req.user._id;

    const study = await Study.findOne({ studyId });
    if (!study) return res.status(404).json({ message: "Study not found" });
    if (study.creatorId !== creatorId) return res.status(403).json({ message: "Not authorized" });

    const phase = study.phases.find(p => p.phaseId === phaseId);
    if (!phase) return res.status(404).json({ message: "Phase not found" });

    phase.questions.push(questionData);
    await study.save();

    res.status(201).json({ message: "Question added", study });
  } catch (error) {
    res.status(500).json({ message: "Error adding question", error: error.message });
  }
};
//linked 
// Remove a question from a phase
exports.removeQuestion = async (req, res) => {
  try {
    const { studyId, phaseId, questionId } = req.params;
    const creatorId = req.user.userId || req.user.id || req.user.sub || req.user._id;

    const study = await Study.findOne({ studyId });
    if (!study) return res.status(404).json({ message: "Study not found" });
    if (study.creatorId !== creatorId) return res.status(403).json({ message: "Not authorized" });

    const phase = study.phases.find(p => p.phaseId === phaseId);
    if (!phase) return res.status(404).json({ message: "Phase not found" });

    phase.questions = phase.questions.filter(q => q.questionId !== questionId);
    await study.save();

    res.status(200).json({ message: "Question removed", study });
  } catch (error) {
    res.status(500).json({ message: "Error removing question", error: error.message });
  }
};

//linked
// Update a specific question in a phase
exports.updateQuestion = async (req, res) => {
  try {
    const { studyId, phaseId, questionId } = req.params;
    const updateData = req.body;
    const creatorId = req.user.userId || req.user.id || req.user.sub || req.user._id;

    const study = await Study.findOne({ studyId });
    if (!study) return res.status(404).json({ message: "Study not found" });
    if (study.creatorId !== creatorId) return res.status(403).json({ message: "Not authorized" });

    const phase = study.phases.find(p => p.phaseId === phaseId);
    if (!phase) return res.status(404).json({ message: "Phase not found" });

    const question = phase.questions.find(q => q.questionId === questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    Object.assign(question, updateData);
    await study.save();

    res.status(200).json({ message: "Question updated", study });
  } catch (error) {
    res.status(500).json({ message: "Error updating question", error: error.message });
  }
};
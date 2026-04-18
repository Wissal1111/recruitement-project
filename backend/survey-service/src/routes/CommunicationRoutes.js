const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/Communication');

// This endpoint is used by other microservices (e.g., Participant Service)
// GET: /api/communication/study-structure/:studyId
router.get('/study-structure/:studyId', communicationController.getStudyStructureForParticipant);

// GET: /api/communication/validate-phase/:studyId/:phaseId
router.get('/validate-phase/:studyId/:phaseId', communicationController.validatePhaseAccess);

module.exports = router;
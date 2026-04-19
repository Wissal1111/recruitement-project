const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const authMiddleware = require('../middlewares/authMiddleware');

// All study routes are protected with authMiddleware
//router.use(authMiddleware);

// POST: /api/studies - Create a new study
router.post('/', authMiddleware, studyController.createStudy);

// GET: /api/studies/my-studies - Get all studies for the logged-in creator
router.get('/my-studies', authMiddleware, studyController.getStudiesByCreator);

// GET: /api/studies/:studyId - Get a single study by ID
router.get('/:studyId', authMiddleware, studyController.getStudyById);

// DELETE: /api/studies/:studyId - Delete a study by ID (Owner only)
router.delete('/:studyId', authMiddleware, studyController.deleteStudy);

// PATCH: /api/studies/:studyId/status - Update study status
router.patch('/:studyId/status', authMiddleware, studyController.updateStudyStatus);

// PUT: /api/studies/:studyId/phases/:phaseId - Update a specific phase
router.put('/:studyId/phases/:phaseId', authMiddleware, studyController.updatePhase);

// POST: /api/studies/:studyId/phases/:phaseId/questions - Add a question to a form
router.post('/:studyId/phases/:phaseId/questions', authMiddleware, studyController.addQuestionToForm);

// DELETE: /api/studies/:studyId/phases/:phaseId/questions/:questionId - Remove a question
router.delete('/:studyId/phases/:phaseId/questions/:questionId', authMiddleware, studyController.removeQuestion);

module.exports = router;
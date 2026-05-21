const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const isStudyCreator = require("../services/isStudyCreator");
const ctrl = require("../controllers");

//submit routes

// POST: /api/responses/draft - done: create or overwrite a draft response for a participant in a study phase (per-phase auto-save)
router.post("/draft",         auth, ctrl.saveDraft);

// PATCH: /api/responses/draft/answer - done: edit a single answer in the draft (per-question auto-save)
router.patch("/draft/answer", auth, ctrl.saveAnswer);

// POST: /api/responses - done: submit a response (finalize, no more edits allowed)
router.post("/",              auth, ctrl.submitResponse);


//query routes

// GET: /api/responses/me/grouped-by-study - done: get all responses of the logged-in participant grouped by study
router.get("/me/by-study",            auth, ctrl.getMyResponsesGroupedByStudy);

// GET: /api/responses/me - done: get all responses of the logged-in participant(phases)
router.get("/me",                            auth, ctrl.getMyResponses);

// GET: /api/responses/study/:studyId - done: get all responses for a study (all phases, all participants)
router.get("/study/:studyId",                auth,isStudyCreator, ctrl.getResponsesByStudy);

// GET: /api/responses/study/:studyId/phase/:phaseId - done: get all responses for a specific phase of a study (all participants)
router.get("/study/:studyId/phase/:phaseId", auth,isStudyCreator, ctrl.getResponsesByPhase);

// GET: /api/responses/participant/:participantId - done: get all responses of a specific participant of this creator's studies (all phases)
router.get("/participant/:participantId",     auth,isStudyCreator, ctrl.getResponsesByParticipant);

// GET: /api/responses/:responseId - done: get a single response by its ID (only if it belongs to the logged-in participant)
router.get("/:responseId",    auth, ctrl.getResponseById);

//complete testing from here tomorrow
//management routes
router.put("/:responseId",    auth, ctrl.updateResponse);
router.delete("/:responseId", auth, ctrl.deleteResponse);


module.exports = router;
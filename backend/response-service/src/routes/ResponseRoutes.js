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

//==============
//query routes

// GET: /api/responses/me/grouped-by-study - done: get all responses of the logged-in participant grouped by study
router.get("/me/by-study",            auth, ctrl.getMyResponsesGroupedByStudy);

// GET: /api/responses/me - done: get all responses of the logged-in participant (phases)
router.get("/me",                            auth, ctrl.getMyResponses);

// GET: /api/responses/me/submitted - done: get all submitted responses of the logged-in participant (phases)
router.get("/me/submitted",                    auth, ctrl.getMySubmitted);

//==========================
//participant drafts queries
// GET: /api/responses/me/drafts -  done: get all draft responses of the logged-in participant (phases)
router.get("/me/drafts",                     auth, ctrl.getMyDrafts);

// GET: /api/responses/me/drafts-by-study -  done: get all draft responses of the logged-in participant grouped by study
router.get("/me/drafts-by-study",            auth, ctrl.getMyDraftsGroupedByStudy);

// GET: /api/responses/me/drafts-by-study/:studyId -  done: get draft responses of the logged-in participant for one study
router.get("/me/drafts-by-study/:studyId",    auth, ctrl.getMyDraftsByStudyId);

// GET: /api/responses/me/drafts-by-study/:studyId/phase/:phaseId -  done: get draft response of the logged-in participant for a specific phase of a study
router.get("/me/drafts-by-study/:studyId/phase/:phaseId",    auth, ctrl.getMyDraftsByStudyAndPhaseId);

// GET: /api/responses/me/drafts/:responseId - done:get a single draft response by its ID (only if it belongs to the logged-in participant)
router.get("/me/drafts/:responseId",         auth, ctrl.getMyDraftById);


//=================
//creator queries
// GET: /api/responses/study/:studyId - done: get all responses for a study by id (all phases, all participants)
router.get("/study/:studyId",                auth,isStudyCreator, ctrl.getResponsesByStudy);

// GET: /api/responses/study/:studyId/phase/:phaseId - done: get all responses for a specific phase of a study (all participants)
router.get("/study/:studyId/phase/:phaseId", auth,isStudyCreator, ctrl.getResponsesByPhase);

// GET: /api/responses/participant/:participantId - done: get all responses of a specific participant of this creator's studies (all phases)
router.get("/participant/:participantId",     auth,isStudyCreator, ctrl.getResponsesByParticipant);

// Update an already submitted response for a specific phase
router.put(
  "/study/:studyId/phase/:phaseId",
  auth,
  ctrl.upsertSubmittedResponse
);
//=================
// GET: /api/responses/:responseId - done: get a single response by its ID (only if it belongs to the logged-in participant)
router.get("/:responseId",    auth, ctrl.getResponseById);

//======================
//management routes

// DELETE: /api/responses/:responseId - delete a response (only if it's still a draft and belongs to the logged-in participant)
router.delete("/:responseId", auth, ctrl.deleteResponse);


//======================
//analytics routes

// GET: /api/responses/study/:studyId/analytics - done: get analytics for a study (answer distributions per question, etc.)
router.get("/study/:studyId/analytics", auth, isStudyCreator, ctrl.getStudyAnalytics);

// GET: /api/responses/study/:studyId/stats - done: get response stats for a study (total responses, submitted vs drafts, per phase breakdown)
router.get("/study/:studyId/stats", auth, isStudyCreator, ctrl.getStudyStats);

module.exports = router;
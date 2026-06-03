import axiosInstance from "./axiosInstance";

const ResponseApi = {
  // ======================
  // SUBMIT / DRAFT ACTIONS
  // ======================

  // Create or overwrite a draft (per phase auto-save)
  saveDraft: (data) =>
    axiosInstance.post("/responses/draft", data),

  // Update a single answer in draft (auto-save per question)
  saveAnswer: (data) =>
    axiosInstance.patch("/responses/draft/answer", data),

  // Submit final response (lock edits)
  submitResponse: (data) =>
    axiosInstance.post("/responses", data),

  // ======================
  // PARTICIPANT QUERIES
  // ======================

  // all responses grouped by study
  getMyResponsesGroupedByStudy: () =>
    axiosInstance.get("/responses/me/by-study"),

  // all responses (all phases)
  getMyResponses: () =>
    axiosInstance.get("/responses/me"),

  // only submitted responses
  getMySubmitted: () =>
    axiosInstance.get("/responses/me/submitted"),

  // drafts only
  getMyDrafts: () =>
    axiosInstance.get("/responses/me/drafts"),

  // drafts grouped by study
  getMyDraftsGroupedByStudy: () =>
    axiosInstance.get("/responses/me/drafts-by-study"),

  // drafts for a specific study
  getMyDraftsByStudyId: (studyId) =>
    axiosInstance.get(`/responses/me/drafts-by-study/${studyId}`),
  
// draft for a specific phase
getMyDraftByStudyAndPhase: async (studyId, phaseId) => {
  try {
    return await axiosInstance.get(
      `/responses/me/drafts-by-study/${studyId}/phase/${phaseId}`
    );
  } catch (err) {
    if (err.response?.status === 404) {
      return { data: null }; // No draft yet, start fresh
    }
    throw err;
  }
},

  // single draft by id
  getMyDraftById: (responseId) =>
    axiosInstance.get(`/responses/me/drafts/${responseId}`),

  // ======================
  // CREATOR QUERIES
  // ======================

  getResponsesByStudy: (studyId) =>
    axiosInstance.get(`/responses/study/${studyId}`),

  getResponsesByPhase: (studyId, phaseId) =>
    axiosInstance.get(`/responses/study/${studyId}/phase/${phaseId}`),

  getResponsesByParticipant: (participantId) =>
    axiosInstance.get(`/responses/participant/${participantId}`),
  exportPhaseResponses: (studyId, phaseId) =>
    axiosInstance.get(`/responses/study/${studyId}/phase/${phaseId}/export`, {
        responseType: "blob",
    }),

  // update submitted response (admin/creator edit)
  upsertSubmittedResponse: (studyId, phaseId, data) =>
    axiosInstance.put(
      `/responses/study/${studyId}/phase/${phaseId}`,
      data
    ),

  // ======================
  // SINGLE RESOURCE
  // ======================

  getResponseById: (responseId) =>
    axiosInstance.get(`/responses/${responseId}`),

  deleteResponse: (responseId) =>
    axiosInstance.delete(`/responses/${responseId}`),

  // ======================
  // ANALYTICS
  // ======================

  getStudyAnalytics: (studyId) =>
    axiosInstance.get(`/responses/study/${studyId}/analytics`),

  getStudyStats: (studyId) =>
    axiosInstance.get(`/responses/study/${studyId}/stats`),
};

export default ResponseApi;
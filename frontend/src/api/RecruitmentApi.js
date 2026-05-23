import api from "./axiosInstance";
import api from "./recruitmentAxios";

// SLOTS
export const createSlot = (phaseId, studyId, data) =>
    api.post(`/recruitment/phases/${phaseId}/slots?studyId=${studyId}`, data);
export const getSlot = (phaseId) =>
    api.get(`/recruitment/phases/${phaseId}/slots`);

// CRITERIA
export const createCriteria = (studyId, data) =>
    api.post(`/recruitment/studies/${studyId}/criteria`, data);
export const getCriteria = (studyId) =>
    api.get(`/recruitment/studies/${studyId}/criteria`);
export const updateCriteria = (studyId, data) =>
    api.put(`/recruitment/studies/${studyId}/criteria`, data);
export const previewEligiblePool = (studyId) =>
    api.get(`/recruitment/studies/${studyId}/criteria/preview`);
export const getEligibleStudies = () =>
    api.get(`/recruitment/studies/eligible`);

// CAMPAIGNS
export const launchCampaign = (studyId, data) =>
    api.post(`/recruitment/studies/${studyId}/campaigns`, data);
export const getCampaigns = (studyId) =>
    api.get(`/recruitment/studies/${studyId}/campaigns`);
export const cancelCampaign = (campaignId) =>
    api.put(`/recruitment/campaigns/${campaignId}/cancel`);
export const getCampaignStats = (campaignId) =>
    api.get(`/recruitment/campaigns/${campaignId}/stats`);
export const resendInvitations = (campaignId) =>
    api.post(`/recruitment/campaigns/${campaignId}/resend`);

// INVITATIONS (participant)
export const getMyInvitations = () =>
    api.get(`/recruitment/invitations/me`);
export const acceptInvitation = (id) =>
    api.put(`/recruitment/invitations/${id}/accept`);
export const declineInvitation = (id) =>
    api.put(`/recruitment/invitations/${id}/decline`);

// APPLICATIONS
export const applyToStudy = (data) =>
    api.post(`/recruitment/apply`, data);
export const getApplicationsByStudy = (studyId, status) =>
    api.get(`/recruitment/studies/${studyId}/applications${status ? `?status=${status}` : ""}`);
export const cancelApplication = (id) =>
    api.delete(`/recruitment/applications/${id}`);
export const reviewApplication = (applicationId, data) =>
    api.put(`/recruitment/screening/${applicationId}/review`, data);

// PARTICIPATIONS
export const startParticipation = (applicationId) =>
    api.post(`/recruitment/participations/start`, { applicationId });
export const completeParticipation = (id) =>
    api.put(`/recruitment/participations/${id}/complete`);
export const getMyParticipations = () =>
    api.get(`/recruitment/participations/me`);
export const updateParticipationStatus = (id, status) =>
    api.put(`/recruitment/participations/${id}/status`, { status });

// BLACKLIST
export const blacklistParticipant = (data) =>
    api.post(`/recruitment/blacklist`, data);
export const getBlacklist = (studyId) =>
    api.get(`/recruitment/studies/${studyId}/blacklist`);
export const removeFromBlacklist = (id) =>
    api.delete(`/recruitment/blacklist/${id}`);
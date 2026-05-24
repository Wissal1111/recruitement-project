import api from "./axiosInstance"; 

/**
 * Add a new phase to a study
 */
export const addPhase = async (studyId, phaseData) => {
  try {
    const response = await api.post(`/studies/${studyId}/phases`, phaseData);
    return response.data;
  } catch (error) {
    console.error("addPhase error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update a specific phase
 */
export const updatePhase = async (studyId, phaseId, phaseData) => {
  try {
    const response = await api.put(`/studies/${studyId}/phases/${phaseId}`, phaseData);
    return response.data;
  } catch (error) {
    console.error("updatePhase error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete a phase
 */
export const deletePhase = async (studyId, phaseId) => {
  try {
    const response = await api.delete(`/studies/${studyId}/phases/${phaseId}`);
    return response.data;
  } catch (error) {
    console.error("deletePhase error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Add a question to a phase
 */
export const addQuestion = async (studyId, phaseId, questionData) => {
  try {
    const response = await api.post(`/studies/${studyId}/phases/${phaseId}/questions`, questionData);
    return response.data;
  } catch (error) {
    console.error("addQuestion error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Remove a question from a phase
 */
export const removeQuestion = async (studyId, phaseId, questionId) => {
  try {
    const response = await api.delete(`/studies/${studyId}/phases/${phaseId}/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("removeQuestion error:", error.response?.data || error.message);
    throw error;
  }
};
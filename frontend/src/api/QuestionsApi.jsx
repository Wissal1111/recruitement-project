import api from "./axiosInstance";

export const addQuestion = async (studyId, phaseId, questionData) => {
  try {
    const response = await api.post(`/studies/${studyId}/phases/${phaseId}/questions`, questionData);
    return response.data;
  } catch (error) {
    console.error("addQuestion error:", error.response?.data || error.message);
    throw error;
  }
};

export const removeQuestion = async (studyId, phaseId, questionId) => {
  try {
    const response = await api.delete(`/studies/${studyId}/phases/${phaseId}/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("removeQuestion error:", error.response?.data || error.message);
    throw error;
  }
};

export const updateQuestion = async (studyId, phaseId, questionId, questionData) => {
  try {
    const response = await api.put(
      `/studies/${studyId}/phases/${phaseId}/questions/${questionId}`,
      questionData
    );
    return response.data;
  } catch (error) {
    console.error("updateQuestion error:", error.response?.data || error.message);
    throw error;
  }
};
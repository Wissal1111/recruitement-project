import api from "./axiosInstance";

/**
 * Create Study
 */
export const createStudy = async (studyData) => {
  try {
    const response = await api.post("/studies", studyData);
    return response.data;
  } catch (error) {
    console.error("createStudy error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get All Studies
 */
export const getStudies = async () => {
  try {
    const response = await api.get("/studies");
    return response.data;
  } catch (error) {
    console.error("getStudies error:", error.response?.data || error.message);
    throw error;
  }
};

/* /api/studies/my-studies */
export const getMyStudies = async () => {
  try {
    const response = await api.get("/studies/my-studies");
    return response.data;
  } catch (error) {
    console.error("getMyStudies error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get Study By ID
 */
export const getStudyById = async (studyId) => {
  try {
    const response = await api.get(`/studies/${studyId}`);
    return response.data;
  } catch (error) {
    console.error(
      "getStudyById error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Update Study
 */
export const updateStudy = async (studyId, updatedData) => {
  try {
    const response = await api.put(`/studies/${studyId}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("updateStudy error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete Study
 */
export const deleteStudy = async (studyId) => {
  try {
    const response = await api.delete(`/studies/${studyId}`);
    return response.data;
  } catch (error) {
    console.error("deleteStudy error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Publish Study
 */
export const publishStudy = async (studyId) => {
    try {
        const response = await api.patch(`/studies/${studyId}/status`, {
            status: "PUBLISHED"
        });

        return response.data;
    } catch (error) {
        console.error("publishStudy error:", error.response?.data || error.message);
        throw error;
    }
};
export const getStudyByIdPublic = async (studyId) => {
  try {
    const response = await api.get(`/studies/extern/${studyId}`);
    return response.data;
  } catch (error) {
    console.error("getStudyByIdPublic error:", error.response?.data || error.message);
    throw error;
  }
};
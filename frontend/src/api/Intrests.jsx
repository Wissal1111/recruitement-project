import api from "./axiosInstance";

export const addUserInterests = async (interestIds) => {
    try {
        const response = await api.post("/profile/interests", { interestIds });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getUserInterests = async () => {
    try {
        const response = await api.get("/profile/interests");
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getAllInterests = async () => {
    try {
        const response = await api.get("/profile/interests/all");
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteUserInterest = async (id) => {
    try {
        const response = await api.delete(`/profile/interests/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateUserInterests = async (interestIds) => {
    try {
        const response = await api.put("/profile/interests", { interestIds });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
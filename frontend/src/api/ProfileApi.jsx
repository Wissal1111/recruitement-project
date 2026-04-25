import api from "../api/axiosInstance";

const API_URL = "/profile";

// get profile info
export const getProfile = async () => {
    try {
        const response = await api.get(API_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
// update profile
export const updateProfile = async (profileData) => {
    try {
        const response = await api.put(API_URL, profileData, {
            headers: {
                "Content-Type": "application/json",
            }
        });

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
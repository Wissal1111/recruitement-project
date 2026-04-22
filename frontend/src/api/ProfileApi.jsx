import axios from "axios";

const API_URL = "http://localhost:90/api/profile";

export const updateProfile = async (profileData, token) => {
    try {
        const response = await axios.put(API_URL, profileData, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
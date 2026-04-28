import api from "../api/axiosInstance";


export const getMyRoles = async () => {
    try {
        const response = await api.get("/roles/me");
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const becomeCreator = async () => {
    try {
        const response = await api.post("/roles/me/creator");
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

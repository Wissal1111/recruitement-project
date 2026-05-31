import api from "../api/axiosInstance";


//register
export const registerUser = async (userData) => {
  try {
    const { data } = await api.post("/auth/register", userData);
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

//login
export const loginUser = async (data) => {
  try {
    const { data: res } = await api.post("/auth/login", data);
    return res;
  } catch (error) {
    throw error.response?.data || error;
  }
};
// logout
export const logoutUser = async (refreshToken) => {
    try {
        const response = await api.post("/auth/logout", { refreshToken });
        return response.data;
    } catch (error) {
        console.warn("Logout API call failed, clearing session anyway:", error);
        return null;
    }
};

// change password
export const changePassword = async ({ oldPassword, newPassword }) => {
    try {
        const response = await api.put("/auth/change-password", { oldPassword, newPassword });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
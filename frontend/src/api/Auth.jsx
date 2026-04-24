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
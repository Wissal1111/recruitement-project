import axios from "axios";

const registerUser = async (userData) => {
  try {
    const response = await axios.post(
      "http://localhost:90/api/auth/register",
      userData
    );

    console.log("Success:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    throw error;
  }
};
const loginUser = async (data) => {
  try {
    const response = await axios.post(
      "http://localhost:90/api/auth/login",
      data
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};
export{registerUser,loginUser} ;
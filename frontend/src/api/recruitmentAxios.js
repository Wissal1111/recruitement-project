import axios from "axios";

const recruitmentApi = axios.create({
    baseURL: "http://localhost:90/api",
});

recruitmentApi.interceptors.request.use((config) => {
    const session = JSON.parse(localStorage.getItem("session") || "{}");
    if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
});

export default recruitmentApi;
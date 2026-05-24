import axios from "axios";
import { getSession } from "../utils/AuthSession";

const recruitmentApi = axios.create({
    baseURL: "http://localhost:90/api",
});

recruitmentApi.interceptors.request.use((config) => {
    const { accessToken } = getSession();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

export default recruitmentApi;
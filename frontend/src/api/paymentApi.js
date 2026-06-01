// src/api/paymentApi.js
import axios from "axios";
import { getSession } from "../utils/AuthSession";

const paymentApi = axios.create({
    baseURL: "http://localhost:90/api", // Gateway
});

paymentApi.interceptors.request.use((config) => {
    const { accessToken } = getSession();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// WALLET
export const getMyWallet = () => paymentApi.get("/wallet/me");
export const getWalletStats = () => paymentApi.get("/wallet/me/stats");

// TRANSACTIONS
export const getTransactionHistory = (params) =>
    paymentApi.get("/transactions/history", { params });
export const getTransactionSummary = () =>
    paymentApi.get("/transactions/summary");

// REWARDS (participant)
export const getMyRewards = () =>
    paymentApi.get("/rewards/participant/me"); // ou /rewards/participant/:id

// PAYMENT CARDS (creator)
export const getPaymentCards = () => paymentApi.get("/payment-cards/user/");
export const createPaymentCard = (data) => paymentApi.post("/payment-cards", data);

export default paymentApi;
import api from "./axiosInstance";

// WALLET
export const getMyWallet      = () => api.get("/wallet/me");
export const getWalletStats   = () => api.get("/wallet/me/stats");

// TRANSACTIONS
export const purchasePoints   = (data) => api.post("/transactions/purchase", data);
export const getTransactionHistory = (params) => api.get("/transactions/history", { params })
export const getTransactionSummary = () =>
    api.get("/transactions/summary");

// CARDS
export const getMyCards = () =>
    api.get("/payment-cards/user/");
export const createCard = (data) =>
    api.post("/payment-cards", data);
export const deleteCard = (cardId) =>
    api.delete(`/payment-cards/${cardId}/user`);
export const updateCard = (cardId, data) =>
    api.put(`/payment-cards/${cardId}/user`, data);
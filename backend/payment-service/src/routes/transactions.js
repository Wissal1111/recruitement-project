const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
  purchasePoints,
  getTransactionHistory,
  getTransactionSummary,
} = require('../services/transactionService');

router.post('/purchase', authMiddleware, async (req, res) => {
  try {
    const transaction = await purchasePoints(req.user.userId, req.body);
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const result = await getTransactionHistory(req.user.userId, req.query);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const summary = await getTransactionSummary(req.user.userId);
    res.json(summary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
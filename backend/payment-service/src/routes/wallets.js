const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { getWalletByExternalId, getWalletStats } = require('../services/walletService');

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const wallet = await getWalletByExternalId(req.user.userId, req.user.role);
    res.json(wallet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/me/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await getWalletStats(req.user.userId, req.user.role);
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
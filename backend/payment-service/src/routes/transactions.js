const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
  purchasePoints,
  getTransactionHistory,
  getTransactionSummary,
} = require('../services/transactionService');

const { getOrCreateUser } = require('../services/userService');
const { deductPoints } = require('../services/walletService');
const prisma = require('../config/prisma');

router.post('/purchase', authMiddleware, async (req, res) => {
  try {
    const transaction = await purchasePoints(req.user.userId, req.body);
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ NEW: Withdraw points (participant converts points to money)
router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { points } = req.body;

    if (!points || Number(points) <= 0) {
      return res.status(400).json({ error: 'points must be a positive number' });
    }

    const pointsNum = Number(points);

    // ✅ Deduct from availablePoints (not lockedPoints)
    const user = await getOrCreateUser(userId, 'participant');
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const available = Number(wallet.availablePoints);
    if (available < pointsNum) {
      return res.status(400).json({
        error: `Insufficient points. You have ${available.toFixed(0)} pts available.`
      });
    }

    // ✅ Deduct from available
    await prisma.wallet.update({
      where: { userId: user.id },
      data: {
        availablePoints: { decrement: pointsNum },
        totalPoints: { decrement: pointsNum },
      }
    });

    // ✅ Record transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'refund',
        amount: pointsNum / 100, // convert to $
        pointsValue: pointsNum,
        description: `Withdrawal of ${pointsNum.toFixed(0)} points ($${(pointsNum / 100).toFixed(2)})`,
        status: 'completed',
      }
    });

    res.json({
      success: true,
      withdrawn: pointsNum,
      usdValue: (pointsNum / 100).toFixed(2),
      transaction
    });
  } catch (error) {
    console.error('Withdraw error:', error);
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
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { deductPoints, releasePoints, addPoints } = require('../services/walletService');
const { getOrCreateUser } = require('../services/userService');
const {
  recordAllocationTransaction,
  recordReleaseTransaction,
  recordRewardTransaction,
  recordCommissionTransaction,
} = require('../services/transactionService');

// POST /api/points/allocate
// Creator locks points when study is published
router.post('/allocate', authMiddleware, async (req, res) => {
  try {
    const creatorId = req.user.userId;
    const { totalPoints, studyId } = req.body;

    if (!totalPoints || Number(totalPoints) <= 0) {
      return res.status(400).json({ error: 'totalPoints must be a positive number' });
    }

    await deductPoints(creatorId, Number(totalPoints), 'creator');

    const creator = await getOrCreateUser(creatorId, 'creator');
    await recordAllocationTransaction(creator.id, Number(totalPoints), studyId || null);

    res.json({ success: true, allocated: Number(totalPoints) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/points/release
// Release locked points back to creator (budget reduced or study cancelled)
router.post('/release', authMiddleware, async (req, res) => {
  try {
    const creatorId = req.user.userId;
    const { totalPoints, studyId } = req.body;

    if (!totalPoints || Number(totalPoints) <= 0) {
      return res.status(400).json({ error: 'totalPoints must be a positive number' });
    }

    await releasePoints(creatorId, Number(totalPoints), 'creator');

    const creator = await getOrCreateUser(creatorId, 'creator');
    await recordReleaseTransaction(creator.id, Number(totalPoints), studyId || null);

    res.json({ success: true, released: Number(totalPoints) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/points/reward
// Add points to participant after phase completion
router.post('/reward', authMiddleware, async (req, res) => {
  try {
    const { participantId, rewardAmount, studyId, phaseId } = req.body;

    if (!participantId || !rewardAmount) {
      return res.status(400).json({ error: 'participantId and rewardAmount are required' });
    }

    const amount = Number(rewardAmount);
    if (amount <= 0) {
      return res.status(400).json({ error: 'rewardAmount must be positive' });
    }

    const commission = Number((amount * 0.15).toFixed(2));
    const participantPoints = Number((amount - commission).toFixed(2));

    const externalRef = phaseId || studyId || null;

    await addPoints(participantId, participantPoints, 'participant');

    const participant = await getOrCreateUser(participantId, 'participant');
    await recordRewardTransaction(participant.id, participantPoints, externalRef);

    res.json({
      success: true,
      participantPoints,
      commission,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//ponit.js
module.exports = router;
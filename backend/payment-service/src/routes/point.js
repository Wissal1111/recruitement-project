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
    const { participantId: bodyParticipantId, rewardAmount, studyId, phaseId } = req.body;
    const participantId = bodyParticipantId || req.user?.userId;

    if (!participantId || rewardAmount == null) {
      return res.status(400).json({
        error: 'participantId and rewardAmount are required',
        details: {
          participantId: bodyParticipantId,
          fallbackParticipantId: req.user?.userId,
          rewardAmount,
        },
      });
    }

    const amount = Number(rewardAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'rewardAmount must be a positive number' });
    }

    const commission = Number((amount * 0.15).toFixed(2));
    const participantPoints = Number((amount - commission).toFixed(2));

    const externalRef = phaseId || studyId || null;

    // Convert external ID to internal user ID
    const participant = await getOrCreateUser(participantId, 'participant');

    // addPoints expects an externalId (string). Pass the externalId to avoid creating/finding the wrong user.
    const externalParticipantId = participant.externalId || String(participantId);
    await addPoints(externalParticipantId, participantPoints, 'participant');
    await recordRewardTransaction(participant.id, participantPoints, externalRef);
//.
    const commissionPercent = 15;

    res.json({
      success: true,
      message: `Reward processed: participant received ${participantPoints} points; platform commission ${commission} (${commissionPercent}%).`,
      originalAmount: amount,
      participantPoints,
      commission,
      commissionPercent,
      externalRef,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//ponit.js
module.exports = router;
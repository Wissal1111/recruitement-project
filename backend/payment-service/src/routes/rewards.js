const express = require('express');
const router = express.Router();
const {
  completePhase,
  getParticipantRewards,
  getPhaseRewards,
  getRewardStatistics,
  verifyPhaseCompletion,
} = require('../services/rewardService');

router.post('/complete-phase', async (req, res) => {
 try {
    const result = await completePhase(
      req.body.participantUserId,
      req.body.phaseId,
      req.body.rewardAmount,   // ← ajouter
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/participant/:participantUserId', async (req, res) => {
  try {
    const rewards = await getParticipantRewards(Number(req.params.participantUserId));
    res.json(rewards);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/phase/:phaseId', async (req, res) => {
  try {
    const rewards = await getPhaseRewards(Number(req.params.phaseId));
    res.json(rewards);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/statistics/creator/:creatorId', async (req, res) => {
  try {
    const surveyId = req.query.surveyId ? Number(req.query.surveyId) : undefined;
    const stats = await getRewardStatistics(Number(req.params.creatorId), surveyId);
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/verify/:participantUserId/phase/:phaseId', async (req, res) => {
  try {
    const reward = await verifyPhaseCompletion(
      Number(req.params.participantUserId),
      Number(req.params.phaseId),
    );
    res.json(reward);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

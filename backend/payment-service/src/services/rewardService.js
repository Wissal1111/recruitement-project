const prisma = require('../config/prisma');
const { getOrCreateUser } = require('./userService');
const { addPoints } = require('./walletService');
const {
  recordRewardTransaction,
  recordCommissionTransaction,
} = require('./transactionService');

async function completePhase(externalParticipantId, phaseId, rewardAmount) {
  const participant = await getOrCreateUser(externalParticipantId, 'participant');
  const phase = await prisma.phase.findUnique({
    where: { id: Number(phaseId) },
    include: { survey: true },
  });

  if (!phase) throw new Error('Phase not found');

  const existingReward = await prisma.reward.findUnique({
    where: { phaseId_userId: { phaseId: Number(phaseId), userId: participant.id } },
  });

  if (existingReward) throw new Error('Phase already completed by this participant');

  // Utiliser rewardAmount passé, sinon fallback sur allocatedPoints
  const perParticipant = rewardAmount != null
    ? Number(rewardAmount)
    : Number(phase.allocatedPoints);

  const commission = Number(((perParticipant * 15) / 100).toFixed(2));
  const participantPoints = Number((perParticipant - commission).toFixed(2));

  const reward = await prisma.reward.create({
    data: {
      phaseId: phase.id,
      userId: participant.id,
      points: participantPoints,
      status: 'approved',
    },
  });

  await addPoints(externalParticipantId, participantPoints, 'participant');
  await recordRewardTransaction(participant.id, reward.id, participantPoints);
  await recordCommissionTransaction(phase.survey.creatorId, phase.survey.id, commission);

  return { reward, participantPoints, commission };
}

async function getParticipantRewards(externalParticipantId) {
  const participant = await getOrCreateUser(externalParticipantId, 'participant');

  return prisma.reward.findMany({
    where: { userId: participant.id },
    include: {
      phase: { include: { survey: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getPhaseRewards(phaseId) {
  return prisma.reward.findMany({
    where: { phaseId: Number(phaseId) },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function getRewardStatistics(externalCreatorId, surveyId) {
  const creator = await getOrCreateUser(externalCreatorId, 'creator');

  const where = {
    phase: {
      survey: {
        creatorId: creator.id,
      },
    },
  };

  if (surveyId) {
    where.phase.survey.id = Number(surveyId);
  }

  const rewards = await prisma.reward.findMany({
    where,
    include: { phase: { include: { survey: true } }, user: true },
  });

  const totalRewards = rewards.reduce((sum, reward) => sum + Number(reward.points), 0);
  const participants = new Set(rewards.map((reward) => reward.userId)).size;

  return {
    totalRewards,
    participantCount: participants,
    rewards,
  };
}

async function verifyPhaseCompletion(externalParticipantId, phaseId) {
  const participant = await getOrCreateUser(externalParticipantId, 'participant');

  return prisma.reward.findUnique({
    where: {
      phaseId_userId: {
        phaseId: Number(phaseId),
        userId: participant.id,
      },
    },
    include: { phase: { include: { survey: true } } },
  });
}

module.exports = {
  completePhase,
  getParticipantRewards,
  getPhaseRewards,
  getRewardStatistics,
  verifyPhaseCompletion,
};

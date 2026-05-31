const prisma = require('../config/prisma');
const { getOrCreateUser } = require('./userService');
const { addPoints } = require('./walletService');
const { findPaymentCard } = require('./paymentCardService');

const POINTS_RATE = 5;

async function purchasePoints(externalUserId, dto) {
  const user = await getOrCreateUser(externalUserId, 'creator');
  const card = await findPaymentCard(dto.paymentCardId, externalUserId);

  if (!card) {
    throw new Error('Payment card not found');
  }

  if (!card.isActive) {
    throw new Error('Payment card is not active');
  }

  if (Number(card.automaticBudget) < Number(dto.amount)) {
    throw new Error('Card budget exceeded');
  }

  const points = dto.amount * POINTS_RATE;

  await prisma.paymentCard.update({
    where: { id: card.id },
    data: {
      automaticBudget: { decrement: dto.amount },
    },
  });

  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      type: 'card_purchase',
      amount: dto.amount,
      pointsValue: points,
      paymentCardId: card.id,
      description: `Purchase ${points} points using ${card.cardName}`,
      status: 'completed',
    },
  });

  await addPoints(externalUserId, points, 'creator');

  return transaction;
}

// ✅ FIX: swapped argument order (was: userId, rewardId, points)
async function recordRewardTransaction(userId, points, externalRef) {
  return prisma.transaction.create({
    data: {
      userId,
      type: 'reward',
      amount: 0,
      pointsValue: points,
      externalRef: externalRef || null, // ✅ FIX: was rewardId (not in schema)
      description: 'Reward for completed phase',
      status: 'completed',
    },
  });
}

// ✅ FIX: replaced surveyId with externalRef (not in schema)
async function recordCommissionTransaction(creatorId, points, externalRef) {
  return prisma.transaction.create({
    data: {
      userId: creatorId,
      type: 'commission',
      amount: 0,
      pointsValue: points,
      externalRef: externalRef || null, // ✅ FIX: was surveyId (not in schema)
      description: 'Platform commission (15%)',
      status: 'completed',
    },
  });
}

// ✅ FIX: renamed from recordSurveyAllocationTransaction to match import in points.routes.js
async function recordAllocationTransaction(creatorId, points, externalRef) {
  return prisma.transaction.create({
    data: {
      userId: creatorId,
      type: 'allocation',
      amount: 0,
      pointsValue: points,
      externalRef: externalRef || null, // ✅ FIX: was surveyId (not in schema)
      description: 'Points allocated to study',
      status: 'completed',
    },
  });
}

// ✅ FIX: renamed from recordSurveyDeallocationTransaction to match import in points.routes.js
async function recordReleaseTransaction(creatorId, points, externalRef) {
  return prisma.transaction.create({
    data: {
      userId: creatorId,
      type: 'refund',
      amount: 0,
      pointsValue: points,
      externalRef: externalRef || null, // ✅ FIX: was surveyId (not in schema)
      description: 'Points released back to creator',
      status: 'completed',
    },
  });
}

async function getTransactionHistory(externalUserId, query = {}) {
  const user = await getOrCreateUser(externalUserId, 'creator');

  const where = { userId: user.id };

  if (query.type) {
    where.type = query.type;
  }

  if (query.startDate || query.endDate) {
    where.createdAt = {};
    if (query.startDate) {
      where.createdAt.gte = new Date(query.startDate);
    }
    if (query.endDate) {
      where.createdAt.lte = new Date(query.endDate);
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: Number(query.limit ?? 50),
    skip: Number(query.offset ?? 0),
    include: { paymentCard: true }, // ✅ FIX: removed reward: true (not a relation in schema)
  });

  const total = await prisma.transaction.count({ where });

  return { transactions, total };
}

async function getTransactionSummary(externalUserId) {
  const user = await getOrCreateUser(externalUserId, 'creator');

  return prisma.transaction.groupBy({
    by: ['type'],
    where: { userId: user.id },
    _sum: { pointsValue: true, amount: true },
    _count: { id: true },
  });
}

module.exports = {
  purchasePoints,
  recordRewardTransaction,
  recordCommissionTransaction,
  recordAllocationTransaction,   // ✅ FIX: renamed export
  recordReleaseTransaction,      // ✅ FIX: renamed export
  getTransactionHistory,
  getTransactionSummary,
};
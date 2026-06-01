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

async function recordRewardTransaction(userId, points) {
  return prisma.transaction.create({
    data: {
      userId,
      type: 'reward',
      amount: 0,
      pointsValue: points,
      description: 'Reward for completed phase',
      status: 'completed',
    },
  });
}

async function recordCommissionTransaction(creatorId, points) {
  return prisma.transaction.create({
    data: {
      userId: creatorId,
      type: 'commission',
      amount: 0,
      pointsValue: points,
      description: 'Platform commission (15%)',
      status: 'completed',
    },
  });
}

async function recordAllocationTransaction(creatorId, points) {
  return prisma.transaction.create({
    data: {
      userId: creatorId,
      type: 'allocation',
      amount: 0,
      pointsValue: points,
      description: 'Points allocated to study',
      status: 'completed',
    },
  });
}

async function recordReleaseTransaction(creatorId, points) {
  return prisma.transaction.create({
    data: {
      userId: creatorId,
      type: 'refund',
      amount: 0,
      pointsValue: points,
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
    include: { paymentCard: true },
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
  recordAllocationTransaction,
  recordReleaseTransaction,
  getTransactionHistory,
  getTransactionSummary,
};
const prisma = require('../config/prisma');
const { getOrCreateUser } = require('./userService');

async function getOrCreateWallet(internalUserId) {
  let wallet = await prisma.wallet.findUnique({ where: { userId: internalUserId } });

  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { userId: internalUserId } });
  }

  return wallet;
}

async function getWalletByExternalId(externalId, userType) {
  const user = await getOrCreateUser(externalId, userType);
  return getOrCreateWallet(user.id);
}

async function addPoints(externalId, points, userType) {
  const user = await getOrCreateUser(externalId, userType);
  await getOrCreateWallet(user.id);

  return prisma.wallet.update({
    where: { userId: user.id },
    data: {
      totalPoints: { increment: points },
      availablePoints: { increment: points },
    },
  });
}

async function deductPoints(externalId, points, userType) {
  const user = await getOrCreateUser(externalId, userType);
  const wallet = await getOrCreateWallet(user.id);

  if (Number(wallet.availablePoints) < Number(points)) {
    throw new Error('Insufficient wallet points');
  }

  return prisma.wallet.update({
    where: { userId: user.id },
    data: {
      availablePoints: { decrement: points },
      lockedPoints: { increment: points },
    },
  });
}

async function releasePoints(externalId, points, userType) {
  const user = await getOrCreateUser(externalId, userType);
  const wallet = await getOrCreateWallet(user.id);

  if (Number(wallet.lockedPoints) < Number(points)) {
    throw new Error('Insufficient locked points to release');
  }

  return prisma.wallet.update({
    where: { userId: user.id },
    data: {
      lockedPoints: { decrement: points },
      availablePoints: { increment: points },
    },
  });
}

async function getWalletStats(externalId, userType) {
  const user = await getOrCreateUser(externalId, userType);
  const wallet = await getOrCreateWallet(user.id);

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return { wallet, recentTransactions: transactions };
}

module.exports = {
  getOrCreateWallet,
  getWalletByExternalId,
  addPoints,
  deductPoints,
  releasePoints,
  getWalletStats,
};
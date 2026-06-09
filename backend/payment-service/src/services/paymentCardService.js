const prisma = require('../config/prisma');
const { getOrCreateUser } = require('./userService');

async function createPaymentCard(externalUserId, dto) {
  const user = await getOrCreateUser(externalUserId, 'creator');

  // ✅ Map any value to valid CardType enum
  const validCardTypes = ['paypal', 'payoneer', 'stripe', 'custom'];
  const cardType = validCardTypes.includes(dto.cardType?.toLowerCase())
    ? dto.cardType.toLowerCase()
    : 'custom'; // ✅ default to custom if invalid

  return prisma.paymentCard.create({
    data: {
      userId: user.id,
      cardName: dto.cardName,
      cardType: cardType,
      lastFourDigits: dto.lastFourDigits || '0000',
      automaticBudget: dto.automaticBudget ?? 1000.0,
    },
  });
}

async function listPaymentCards(externalUserId) {
  const user = await getOrCreateUser(externalUserId, 'creator');
  return prisma.paymentCard.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
}

async function findPaymentCard(cardId, externalUserId) {
  const user = await getOrCreateUser(externalUserId, 'creator');
  return prisma.paymentCard.findFirst({
    where: { id: Number(cardId), userId: user.id },
  });
}

async function updatePaymentCard(cardId, externalUserId, dto) {
  const card = await findPaymentCard(cardId, externalUserId);
  if (!card) throw new Error('Payment card not found');

  return prisma.paymentCard.update({
    where: { id: card.id },
    data: {
      cardName: dto.cardName ?? card.cardName,
      isActive: dto.isActive ?? card.isActive,
      automaticBudget: dto.automaticBudget ?? card.automaticBudget,
    },
  });
}

async function deletePaymentCard(cardId, externalUserId) {
  const card = await findPaymentCard(cardId, externalUserId);
  if (!card) throw new Error('Payment card not found');

  return prisma.paymentCard.delete({ where: { id: card.id } });
}

async function checkCardBudget(cardId) {
  const card = await prisma.paymentCard.findUnique({ where: { id: Number(cardId) } });
  if (!card) throw new Error('Card not found');

  return {
    cardName: card.cardName,
    automaticBudget: card.automaticBudget,
    isActive: card.isActive,
  };
}

module.exports = {
  createPaymentCard,
  listPaymentCards,
  findPaymentCard,
  updatePaymentCard,
  deletePaymentCard,
  checkCardBudget,
};
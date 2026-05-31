const prisma = require('../config/prisma');

function normalizeExternalId(externalId) {
  if (externalId === undefined || externalId === null) {
    throw new Error('externalId is required');
  }
  const str = String(externalId).trim();
  if (!str) throw new Error('externalId must be a non-empty string');
  return str;
}

async function findUserByExternalId(externalId) {
  const normalizedId = normalizeExternalId(externalId);
  return prisma.user.findUnique({ where: { externalId: normalizedId } });
}

async function getOrCreateUser(externalId, userType) {
  if (!externalId) throw new Error('externalId is required');

  const externalIdString = String(externalId).trim();
  const validUserType = userType === 'creator' ? 'creator' : 'participant';

  return prisma.user.upsert({
    where: { externalId: externalIdString },
    update: {},
    create: {
      externalId: externalIdString,
      email: `user_${externalIdString}@survey.local`,
      userType: validUserType,
    },
  });
}

module.exports = { findUserByExternalId, getOrCreateUser };
const prisma = require('../config/prisma');

exports.validateInterestIds = (req, res, next) => {
  const { interestIds } = req.body;

  if (!Array.isArray(interestIds) || interestIds.length === 0) {
    return res.status(400).json({ message: 'interestIds must be a non-empty array' });
  }

  const cleaned = Array.from(new Set(interestIds.map(id => (id ? id.toString().trim() : '')).filter(Boolean)));
  if (cleaned.length === 0) {
    return res.status(400).json({ message: 'interestIds contains no valid ids' });
  }

  req.interestIds = cleaned;
  next();
};

exports.ensureInterestsExist = async (req, res, next) => {
  try {
    const interestIds = req.interestIds;
    const interests = await prisma.interest.findMany({
      where: { interestId: { in: interestIds } },
      select: { interestId: true }
    });

    const foundIds = interests.map(i => i.interestId);
    const missingIds = interestIds.filter(id => !foundIds.includes(id));

    if (missingIds.length > 0) {
      return res.status(404).json({ message: 'Some interest IDs not found', missingIds });
    }

    req.validInterestIds = foundIds;
    next();
  } catch (err) {
    console.error('Error validating interests:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
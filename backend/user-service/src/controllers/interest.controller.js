const prisma = require('../config/prisma');

exports.getUserInterests = async (req, res) => {
  try {
    const interests = await prisma.userInterest.findMany({
      where: { userId: req.userId },
      include: { interest: true }
    });
    return res.json({ interests });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.addUserInterest = async (req, res) => {
  try {
    const { interestIds } = req.body;

    if (!Array.isArray(interestIds) || interestIds.length === 0) {
      return res.status(400).json({ message: 'interestIds must be a non-empty array' });
    }

    // Validate that all interests exist
    const interests = await prisma.interest.findMany({
      where: { interestId: { in: interestIds } },
      select: { interestId: true }
    });

    const foundIds = interests.map(i => i.interestId);
    const invalidIds = interestIds.filter(id => !foundIds.includes(id));

    if (invalidIds.length > 0) {
      return res.status(404).json({ message: 'Some interests not found', invalidIds });
    }

    // Check for existing user interests
    const existingUserInterests = await prisma.userInterest.findMany({
      where: {
        userId: req.userId,
        interestId: { in: foundIds }
      },
      select: { interestId: true }
    });

    const existingIds = existingUserInterests.map(ui => ui.interestId);
    const newIds = foundIds.filter(id => !existingIds.includes(id));

    if (newIds.length === 0) {
      return res.status(409).json({ message: 'All interests already added' });
    }

    // Add new interests
    const userInterests = await prisma.userInterest.createMany({
      data: newIds.map(interestId => ({ userId: req.userId, interestId })),
      skipDuplicates: true
    });

    const addedInterests = await prisma.userInterest.findMany({
      where: { userId: req.userId, interestId: { in: newIds } },
      include: { interest: true }
    });

    return res.status(201).json({
      message: `${newIds.length} interest(s) added`,
      addedInterests: addedInterests.map(ui => ({ id: ui.id, interest: ui.interest }))
    });
  } catch (err) {
    console.error('Error adding user interests:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUserInterest = async (req, res) => {
  try {
    const { id } = req.params;

    const userInterest = await prisma.userInterest.findFirst({ where: { id, userId: req.userId } });
    if (!userInterest) return res.status(404).json({ message: 'Interest not found' });

    await prisma.userInterest.delete({ where: { id } });
    return res.json({ message: 'Interest removed' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllInterests = async (req, res) => {
  try {
    const interests = await prisma.interest.findMany();
    return res.json({ interests });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserInterests = async (req, res) => {
  try {
    const interestIds = req.validInterestIds;

    const existingUserInterests = await prisma.userInterest.findMany({
      where: { userId: req.userId },
      select: { interestId: true }
    });

    const existingIds = existingUserInterests.map(item => item.interestId);

    const toAdd = interestIds.filter(id => !existingIds.includes(id));
    const toRemove = existingIds.filter(id => !interestIds.includes(id));

    await prisma.$transaction(async (tx) => {
      if (toRemove.length > 0) {
        await tx.userInterest.deleteMany({
          where: { userId: req.userId, interestId: { in: toRemove } }
        });
      }

      if (toAdd.length > 0) {
        await tx.userInterest.createMany({
          data: toAdd.map(interestId => ({ userId: req.userId, interestId })),
          skipDuplicates: true
        });
      }
    });

    const updatedInterests = await prisma.userInterest.findMany({
      where: { userId: req.userId },
      include: { interest: true }
    });

    return res.json({
      message: 'Interests updated successfully',
      interests: updatedInterests.map(ui => ({ id: ui.id, interest: ui.interest }))
    });
  } catch (err) {
    console.error('Error updating user interests', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
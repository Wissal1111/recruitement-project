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
    const { interestId } = req.body;

    const interest = await prisma.interest.findUnique({ where: { interestId } });
    if (!interest) return res.status(404).json({ message: 'Interest not found' });

    const existing = await prisma.userInterest.findFirst({ where: { userId: req.userId, interestId } });
    if (existing) return res.status(409).json({ message: 'Interest already added' });

    const userInterest = await prisma.userInterest.create({
      data: { userId: req.userId, interestId }
    });

    return res.status(201).json({ message: 'Interest added', userInterest });
  } catch (err) {
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
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
const prisma = require('../config/prisma');

exports.getProfile = async (req, res) => {
  try {
    const data = await prisma.user.findUnique({
      where: { userId: req.userId },
      select: {
        userId: true,
        firstname: true,
        lastname: true,
        email: true,
        profilePictureUrl: true,
        isActive: true,
        ceratedAt: true,
        lastLogin: true,
        profile: true,
        roles: { include: { role: true } },
      },
    });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['age', 'gender', 'dateOfBirth', 'education', 'profession', 'country', 'city', 'deviceType', 'bio'];
    const data = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) data[f] = req.body[f]; });

    const filled = allowedFields.filter(f => data[f]).length;
    data.completionScore = Math.round((filled / allowedFields.length) * 100);

    const profile = await prisma.userProfile.update({
      where: { userId: req.userId },
      data
    });

    return res.json({ message: 'Profile updated', profile });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
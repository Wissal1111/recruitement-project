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
        createdAt: true,
        lastLogin: true,
        profile: true,
        roles: { include: { role: true } },
      },
    });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Server error zmr' });
  }
};


exports.updateProfile = async (req, res) => {
  const userId = req.userId; // ✅ from token

  const {
    age,
    gender,
    dateOfBirth,
    education,
    profession,
    country,
    city,
    deviceType,
    bio
  } = req.body;

  try {
    const profile = await prisma.userProfile.upsert({
      where: { userId },

      update: {
        age,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        education,
        profession,
        country,
        city,
        deviceType,
        bio,
        profileCompletedAt: new Date()
      },

      create: {
        userId,
        age,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        education,
        profession,
        country,
        city,
        deviceType,
        bio,
        profileCompletedAt: new Date()
      }
    });

    return res.json({
      message: "Profile updated successfully ✅",
      profile
    });

  } catch (error) {
    console.error("updateProfile error:", error);

    return res.status(500).json({
      message: "Server error ❌",
      detail: error.message
    });
  }
};

exports.updateEarnings = async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount === undefined || typeof amount !== 'number' || Number.isNaN(amount)) {
      return res.status(400).json({ message: 'amount is required and must be a number' });
    }

    if (amount === 0) {
      return res.status(400).json({ message: 'amount must be non-zero' });
    }

    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: req.userId },
      select: { totalEarnings: true }
    });

    if (!existingProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const updatedProfile = await prisma.userProfile.update({
      where: { userId: req.userId },
      data: {
        totalEarnings: {
          increment: amount 
        }
      }
    });

    return res.json({
      message: 'Earnings updated',
      userId: req.userId,
      previousEarnings: existingProfile.totalEarnings,
      newEarnings: updatedProfile.totalEarnings
    });
  } catch (err) {
    console.error('Error updating earnings:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
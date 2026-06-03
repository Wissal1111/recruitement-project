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
exports.searchProfiles = async (req, res) => {
  try {
    const prisma = require('../config/prisma');

    const users = await prisma.user.findMany({
      where: {
        isActive: true
      },
      include: {
        profile: true
      }
    });

    const userIds = users.map(u => u.userId);

    let userInterests = [];

    try {
      userInterests = await prisma.userInterest.findMany({
        where: {
          userId: {
            in: userIds
          }
        },
        select: {
          userId: true,
          interestId: true
        }
      });
    } catch (e) {
      console.log('Could not load user interests:', e.message);
    }

    const interestsByUser = {};

    for (const ui of userInterests) {
      if (!interestsByUser[ui.userId]) {
        interestsByUser[ui.userId] = [];
      }
      interestsByUser[ui.userId].push(ui.interestId);
    }

    const calculateAge = (dateOfBirth) => {
      if (!dateOfBirth) return null;

      const dob = new Date(dateOfBirth);
      const today = new Date();

      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        age--;
      }

      return age;
    };

    const result = users.map((user) => {
      const profile = user.profile || {};

      return {
        userId: user.userId,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,

        age: profile.age ?? calculateAge(profile.dateOfBirth),
        gender: profile.gender,
        country: profile.country,
        education: profile.education,

        interestIds: interestsByUser[user.userId] || []
      };
    });

    return res.json(result);
  } catch (err) {
    console.error('Search profiles error:', err);
    return res.status(500).json({
      message: 'Failed to search profiles',
      error: err.message
    });
  }
};
exports.getProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await prisma.user.findUnique({
      where: { userId },
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
    if (!data) return res.status(404).json({ message: 'User not found' });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
exports.getProfileBasic = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        firstname: true,
        lastname: true,
        profilePictureUrl: true,
        profile: {
          select: {
            profession: true,
            country: true,
          }
        }
      },
    });
    if (!data) return res.status(404).json({ message: 'User not found' });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
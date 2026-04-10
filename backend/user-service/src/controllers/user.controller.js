const prisma = require('../config/prisma');

// Get current authenticated user
const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { userId: req.userId },
      select: {
        userId: true,
        firstname: true,
        lastname: true,
        email: true,
        isActive: true,
        lastLogin: true,
        profilePictureUrl: true,
        createdAt: true,
        profile: {
          select: {
            age: true,
            gender: true,
            dateOfBirth: true,
            education: true,
            profession: true,
            country: true,
            city: true,
            deviceType: true,
            bio: true,
            totalEarnings: true,
            profileCompletedAt: true,
            completionScore: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user info (firstname and lastname)
const updateUserInfo = async (req, res) => {
  try {
    const { firstname, lastname } = req.body;

    const updatedUser = await prisma.user.update({
      where: { userId: req.userId },
      data: { firstname, lastname },
      select: {
        userId: true,
        firstname: true,
        lastname: true,
        email: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user info:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Soft delete account (deactivate)
const deleteAccount = async (req, res) => {
  try {
    await prisma.user.update({
      where: { userId: req.userId },
      data: { isActive: false },
    });

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Deactivate account
const deactivateAccount = async (req, res) => {
  try {
    await prisma.user.update({
      where: { userId: req.userId },
      data: { isActive: false },
    });

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getCurrentUser,
  updateUserInfo,
  deleteAccount,
  deactivateAccount,
};
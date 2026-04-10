const prisma = require('../config/prisma');
exports.getNotificationss = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(notifications);
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
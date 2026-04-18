const prisma = require('../config/prisma');

exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message } = req.body;

    // Validate required fields
    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'userId, title, and message are required' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notification = await prisma.notification.create({
      data: { userId, title, message }
    });

    return res.status(201).json(notification);
  } catch (err) {
    console.error('Create notification error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getNotifications = async (req, res) => {
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

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // From auth middleware

    // Update only if it belongs to the user
    const notification = await prisma.notification.updateMany({
      where: {
        notificationId: id,
        userId: userId,
        isRead: false // Only update if not already read
      },
      data: { isRead: true }
    });

    if (notification.count === 0) {
      return res.status(404).json({ message: 'Notification not found or already read' });
    }

    return res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Mark as read error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.sendTestNotification = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const { title, message } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title: title || 'Test notification',
        message: message || 'This is a test notification to verify notification functionality.'
      }
    });

    return res.status(201).json(notification);
  } catch (err) {
    console.error('Send test notification error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
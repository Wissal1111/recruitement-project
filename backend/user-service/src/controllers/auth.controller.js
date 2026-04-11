const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/prisma');

const generateTokens = (userId) => {
  const access = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refresh = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
  return { access, refresh };
};

exports.register = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const role = 'PARTICIPANT'; 

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstname, lastname, email, passwordHash, isActive: true,
        profile: { create: {} },
      }
    });

    // Assign role
    let roleRecord = await prisma.role.findUnique({ where: { name: role || 'PARTICIPANT' } });
    if (!roleRecord) roleRecord = await prisma.role.create({ data: { name: role || 'PARTICIPANT' } });
    await prisma.userRole.create({ data: { userId: user.userId, roleId: roleRecord.roleId } });

    const { access, refresh } = generateTokens(user.userId);
    await prisma.authToken.create({
      data: {
        userId: user.userId, token: refresh,
        tokenType: 'REFRESH',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return res.status(201).json({ accessToken: access, refreshToken: refresh, userId: user.userId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.accountLocked && user.lockUntil > new Date())
      return res.status(403).json({ message: 'Account locked. Try again later.' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      const locked = attempts >= 5;
      await prisma.user.update({
        where: { userId: user.userId },
        data: { failedLoginAttempts: attempts, accountLocked: locked, lockUntil: locked ? new Date(Date.now() + 15 * 60 * 1000) : null }
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await prisma.user.update({
      where: { userId: user.userId },
      data: { failedLoginAttempts: 0, accountLocked: false, lockUntil: null, lastLogin: new Date() }
    });

    const { access, refresh } = generateTokens(user.userId);
    await prisma.authToken.create({
      data: {
        userId: user.userId, token: refresh,
        tokenType: 'REFRESH',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return res.json({
  accessToken: access,
  refreshToken: refresh,
  user: { userId: user.userId }
});
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await prisma.authToken.updateMany({ where: { token: refreshToken }, data: { isRevoked: true } });
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const record = await prisma.authToken.findFirst({ where: { token: refreshToken, isRevoked: false } });
    if (!record || record.expiresAt < new Date())
      return res.status(401).json({ message: 'Invalid refresh token' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { access } = generateTokens(decoded.userId);
    return res.json({ accessToken: access });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { userId: req.userId } });
    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) return res.status(400).json({ message: 'Old password incorrect' });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { userId: req.userId }, data: { passwordHash } });
    return res.json({ message: 'Password changed' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ message: 'If this email exists, a reset link was sent' });

    await prisma.passwordResetToken.updateMany({ where: { userId: user.userId, isUsed: false }, data: { isUsed: true } });

    const token = crypto.randomBytes(32).toString('hex');
    await prisma.passwordResetToken.create({
      data: { userId: user.userId, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) }
    });

    console.log(`Reset token: ${token}`); 
    return res.json({ message: 'If this email exists, a reset link was sent' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const record = await prisma.passwordResetToken.findFirst({ where: { token, isUsed: false } });
    if (!record || record.expiresAt < new Date())
      return res.status(400).json({ message: 'Invalid or expired token' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { userId: record.userId }, data: { passwordHash } });
    await prisma.passwordResetToken.update({ where: { id: record.id }, data: { isUsed: true } });

    return res.json({ message: 'Password reset successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
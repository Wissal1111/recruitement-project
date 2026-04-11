const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const prisma = require('../config/prisma');

const generateTokens = (userId) => {
  const access = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refresh = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
  return { access, refresh };
};

exports.register = async (req, res) => {
  try {
    const { firstname, lastname, email, password, role } = req.body;

    console.log('Register request body:', req.body);
    console.log('Role received:', role);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstname, lastname, email, passwordHash, isActive: true,
        profile: { create: {} },
      }
    });
    console.log('User registered:', user.userId); 

    // Normalize and map roles
    const normalizedRole = (role || 'participant').toString().trim().toLowerCase();
    console.log('Normalized role:', normalizedRole);
    let roleNames = [];
    
    if (normalizedRole === 'creator') {
      roleNames = ['CREATOR'];
    } else if (normalizedRole === 'both') {
      roleNames = ['PARTICIPANT', 'CREATOR'];
    } else if (normalizedRole === 'admin') {
      roleNames = ['ADMIN'];
    } else if (normalizedRole === 'participant') {
      roleNames = ['PARTICIPANT'];
    } else {
      roleNames = ['PARTICIPANT'];
    }

    console.log('Role names to assign:', roleNames);

    const roleRecords = [];
    for (const roleName of roleNames) {
      let roleRecord = await prisma.role.findUnique({ where: { name: roleName } });
      if (!roleRecord) {
        console.log('Creating role:', roleName);
        roleRecord = await prisma.role.create({ data: { name: roleName } });
      } else {
        console.log('Found existing role:', roleName);
      }
      roleRecords.push(roleRecord);
      await prisma.userRole.create({ data: { userId: user.userId, roleId: roleRecord.roleId } });
    }

    const { access, refresh } = generateTokens(user.userId);
    await prisma.authToken.create({
      data: {
        userId: user.userId, token: refresh,
        tokenType: 'REFRESH', 
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return res.status(201).json({ 
      accessToken: access, 
      refreshToken: refresh, 
      userId: user.userId, 
      roles: roleRecords.map(r => r.name)
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
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

    return res.json({ accessToken: access, refreshToken: refresh });
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

    // ✅ Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    const responseMessage =
      'If this email exists, a password reset link has been sent';

    if (!user) {
      return res.json({ message: responseMessage });
    }

    // ✅ Invalidate old tokens
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.userId,
        isUsed: false
      },
      data: {
        isUsed: true
      }
    });

    // ✅ Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await prisma.passwordResetToken.create({
      data: {
        userId: user.userId,
        token,
        expiresAt
      }
    });

    // ✅ Reset link
    const resetLink = `${
      process.env.FRONTEND_URL || 'http://localhost:3000'
    }/reset-password?token=${token}`;

    // ✅ Nodemailer transporter (FIXED)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // ✅ Mail options
    const mailOptions = {
      from: `"Recruitment Project" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset.</p>
        <p>Click here:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 1 hour.</p>
      `
    };

    // ✅ Send email
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent to:', email);
    } catch (emailError) {
      console.error('Email error:', emailError.message);
    }

    // ✅ Dev logs
    console.log('TOKEN:', token);
    console.log('LINK:', resetLink);

    return res.json({ message: responseMessage });

  } catch (err) {
    console.error('Forgot password ERROR:', err);
    return res.status(500).json({
      message: err.message || 'Server error'
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const record = await prisma.passwordResetToken.findFirst({
      where: { token, isUsed: false },
      include: { user: true }
    });

    if (!record) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { userId: record.userId },
        data: { passwordHash }
      });
      await tx.passwordResetToken.update({
        where: { id: record.id },
        data: { isUsed: true }
      });
    });

    return res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
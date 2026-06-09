const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const prisma = require('../config/prisma');

const getUserIdFromReq = (req) => {
  return (
    req.user?.userId ||
    req.user?.id ||
    req.user?.sub ||
    req.user?._id ||
    req.userId ||
    null
  );
};

const generateTokens = (userId) => {
  const access = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  const refresh = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
  return { access, refresh };
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const role = 'PARTICIPANT';

    console.log('Register request body:', req.body);
    console.log('Role received:', role);

    // safer than findUnique in case email is not marked unique in Prisma
    const existing = await prisma.user.findFirst({
      where: { email }
    });

    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        passwordHash,
        isActive: true,
        profile: {
          create: {}
        }
      }
    });

    console.log('User registered:', user.userId);

    // Normalize and map roles
    const normalizedRole = (role || 'participant')
      .toString()
      .trim()
      .toLowerCase();

    let roleNames = [];
    if (normalizedRole === 'creator') {
      roleNames = ['CREATOR'];
    } else if (normalizedRole === 'both') {
      roleNames = ['PARTICIPANT', 'CREATOR'];
    } else if (normalizedRole === 'admin') {
      roleNames = ['ADMIN'];
    } else {
      roleNames = ['PARTICIPANT'];
    }

    const roleRecords = [];
    for (const roleName of roleNames) {
      let roleRecord = await prisma.role.findFirst({
        where: { name: roleName }
      });

      if (!roleRecord) {
        roleRecord = await prisma.role.create({
          data: { name: roleName }
        });
      }

      roleRecords.push(roleRecord);

      await prisma.userRole.create({
        data: {
          userId: user.userId,
          roleId: roleRecord.roleId
        }
      });
    }

    const { access, refresh } = generateTokens(user.userId);

    await prisma.authToken.create({
      data: {
        userId: user.userId,
        token: refresh,
        tokenType: 'REFRESH',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return res.status(201).json({
      accessToken: access,
      refreshToken: refresh,
      userId: user.userId,
      roles: roleRecords.map((r) => r.name)
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // safer than findUnique
    const user = await prisma.user.findFirst({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Email does not exist' });
    }

    if (user.accountLocked && user.lockUntil && user.lockUntil > new Date()) {
      return res.status(403).json({
        message: 'Account locked. Try again later.'
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const locked = attempts >= 5;

      await prisma.user.update({
        where: { userId: user.userId },
        data: {
          failedLoginAttempts: attempts,
          accountLocked: locked,
          lockUntil: locked ? new Date(Date.now() + 15 * 60 * 1000) : null
        }
      });

      return res.status(401).json({ message: 'Invalid password' });
    }

    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        failedLoginAttempts: 0,
        accountLocked: false,
        lockUntil: null,
        lastLogin: new Date()
      }
    });

    const { access, refresh } = generateTokens(user.userId);

    await prisma.authToken.create({
      data: {
        userId: user.userId,
        token: refresh,
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
    console.error('Login error:', err);
    return res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    await prisma.authToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true }
    });

    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const record = await prisma.authToken.findFirst({
      where: {
        token: refreshToken,
        isRevoked: false
      }
    });

    if (!record || record.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { access } = generateTokens(decoded.userId);

    return res.json({ accessToken: access });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ message: 'Old password incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { userId },
      data: { passwordHash }
    });

    return res.json({ message: 'Password changed' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await prisma.user.findFirst({
      where: { email }
    });

    const responseMessage =
      'If this email exists, a password reset link has been sent';

    if (!user) {
      return res.json({ message: responseMessage });
    }

    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.userId,
        isUsed: false
      },
      data: {
        isUsed: true
      }
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.userId,
        token,
        expiresAt
      }
    });

    const resetLink = `${
      process.env.FRONTEND_URL || 'http://localhost:5173'
    }/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

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

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent to:', email);
    } catch (emailError) {
      console.error('Email error:', emailError.message);
    }

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

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long'
      });
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
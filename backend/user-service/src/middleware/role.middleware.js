const prisma = require('../config/prisma');

/**
 * Validate role assignment/removal payload
 */
const validateRolePayload = (req, res, next) => {
  const { userId, roleName } = req.body;
  const errors = [];

  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    errors.push('userId is required and must be a non-empty string');
  }
  if (!roleName || typeof roleName !== 'string' || roleName.trim() === '') {
    errors.push('roleName is required and must be a non-empty string');
  }

  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  req.body.userId = userId.trim();
  req.body.roleName = roleName.trim();
  next();
};

/**
 * Load user by ID and attach to request
 */
const loadUserById = async (req, res, next) => {
  const { userId } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { userId: true, email: true, isActive: true, firstname: true, lastname: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'Cannot modify roles for inactive user' });
    }

    req.targetUser = user;
    next();
  } catch (error) {
    console.error('Error loading user in role middleware:', error);
    res.status(500).json({ message: 'Failed to load user' });
  }
};

/**
 * Load role by name and attach to request
 */
const loadRoleByName = async (req, res, next) => {
  const { roleName } = req.body;

  try {
    const role = await prisma.role.findUnique({
      where: { name: roleName.toUpperCase() },
      select: { roleId: true, name: true }
    });

    if (!role) {
      return res.status(400).json({
        message: 'Invalid role name',
        availableRoles: ['ADMIN', 'CREATOR', 'PARTICIPANT']
      });
    }

    req.role = role;
    next();
  } catch (error) {
    console.error('Error loading role in middleware:', error);
    res.status(500).json({ message: 'Failed to load role' });
  }
};

/**
 * Ensure user does not already have role (for assign)
 */
const ensureNotAssigned = async (req, res, next) => {
  const userId = req.body.userId;
  const roleId = req.role.roleId;

  try {
    const existing = await prisma.userRole.findFirst({ where: { userId, roleId } });
    if (existing) {
      return res.status(409).json({ message: 'User already has this role', userId, roleName: req.role.name });
    }
    next();
  } catch (error) {
    console.error('Error checking existing role assignment:', error);
    res.status(500).json({ message: 'Role assignment check failed' });
  }
};

/**
 * Ensure user has role (for removal)
 */
const ensureAssigned = async (req, res, next) => {
  const userId = req.body.userId;
  const roleId = req.role.roleId;

  try {
    const existing = await prisma.userRole.findFirst({ where: { userId, roleId }, include: { user: true } });
    if (!existing) {
      return res.status(404).json({ message: 'User does not have this role', userId, roleName: req.role.name });
    }

    req.existingRoleAssignment = existing;
    next();
  } catch (error) {
    console.error('Error checking existing role assignment:', error);
    res.status(500).json({ message: 'Role removal check failed' });
  }
};

module.exports = {
  validateRolePayload,
  loadUserById,
  loadRoleByName,
  ensureNotAssigned,
  ensureAssigned
};
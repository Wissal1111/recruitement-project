const prisma = require('../config/prisma');

/**
 * Role Management Controller
 * Implements clean code principles with optimized database access
 */

// Cache for roles to minimize DB queries
let rolesCache = null;
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get all available roles with caching doooneeee
 */
const getRoles = async (req, res) => {
  try {
    // Check cache first hady rani dyrtna bach chghol ida requet jatah  mara whdokhra my3wdch ydir requet wyroh bdd yhws non yjibha direct ml cache 
    const now = Date.now();
    if (rolesCache && now < cacheExpiry) {
      return res.json({ roles: rolesCache });
    }

    // Fetch from database
    const roles = await prisma.role.findMany({
      select: {
        roleId: true,
        name: true
      },
      orderBy: { name: 'asc' }
    });

    // Update cache
    rolesCache = roles;
    cacheExpiry = now + CACHE_DURATION;

    res.json({ roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
};


/**
 * Remove role from user (Admin only)
 */
const removeRole = async (req, res) => {
  const { userId } = req.body;
  const role = req.role;
  const deletedRole = req.existingRoleAssignment;

  try {
    await prisma.userRole.delete({
      where: { id: deletedRole.id }
    });

    res.json({
      message: 'Role removed successfully',
      removal: {
        userId,
        userEmail: deletedRole.user.email,
        roleName: role.name,
        removedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error removing role:', error);
    res.status(500).json({ message: 'Failed to remove role' });
  }
};

/**
 * Get user's roles
 */
const getUserRoles = async (req, res) => {
  const { userId } = req.params;

  try {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: { select: { name: true } },
        user: { select: { email: true, firstname: true, lastname: true } }
      },
      orderBy: { assignedAt: 'desc' }
    });

    if (userRoles.length === 0) {
      return res.status(404).json({ message: 'User not found or has no roles' });
    }

    const roles = userRoles.map(ur => ({
      roleName: ur.role.name,
      assignedAt: ur.assignedAt
    }));

    res.json({
      user: {
        userId,
        email: userRoles[0].user.email,
        name: `${userRoles[0].user.firstname} ${userRoles[0].user.lastname}`
      },
      roles
    });

  } catch (error) {
    console.error('Error fetching user roles:', error);
    res.status(500).json({ message: 'Failed to fetch user roles' });
  }
};

/**
 * Get current user's roles (for self-check)
 */
const getMyRoles = async (req, res) => {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { userId: req.userId },
      include: { role: { select: { name: true } } },
      orderBy: { assignedAt: 'desc' }
    });

    const roles = userRoles.map(ur => ({
      roleName: ur.role.name,
      assignedAt: ur.assignedAt
    }));

    res.json({ roles });

  } catch (error) {
    console.error('Error fetching current user roles:', error);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
};

module.exports = {
  getRoles,
  removeRole,
  getUserRoles,
  getMyRoles
};
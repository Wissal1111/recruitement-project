const prisma = require('../config/prisma');

/**
 * Middleware to check if user has required role(s)
 */
const requireRole = (requiredRoles, requireAll = false) => {
  return async (req, res, next) => {
    try {
      // ✅ Check authentication
      if (!req.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // ✅ FIX: remove include + select conflict (use ONLY select)
      const userRoles = await prisma.userRole.findMany({
        where: { userId: req.userId },
        select: {
          role: {
            select: { name: true }
          }
        }
      });

      console.log("USER ID:", req.userId);
      console.log("USER ROLES:", userRoles);

      const userRoleNames = userRoles.map(ur => ur.role.name);
      req.userId = decoded.id;

      // 🔐 Check roles
      let hasAccess = false;

      if (requireAll) {
        hasAccess = Array.isArray(requiredRoles)
          ? requiredRoles.every(role => userRoleNames.includes(role))
          : userRoleNames.includes(requiredRoles);
      } else {
        hasAccess = Array.isArray(requiredRoles)
          ? requiredRoles.some(role => userRoleNames.includes(role))
          : userRoleNames.includes(requiredRoles);
      }

      if (!hasAccess) {
        return res.status(403).json({
          message: 'Insufficient permissions',
          required: Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles],
          userRoles: userRoleNames
        });
      }

      // ✅ attach roles
      req.userRoles = userRoleNames;

      next();
    } catch (error) {
      console.error('FULL AUTH ERROR:', error);

      return res.status(500).json({
        message: 'Authorization check failed',
        error: error.message
      });
    }
  };
};

/**
 * Admin shortcut
 */
const requireAdmin = requireRole('ADMIN');

/**
 * Permission middleware
 */
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const rolePermissions = {
        ADMIN: ['manage_users', 'manage_roles', 'view_all'],
        CREATOR: ['create_content', 'edit_own_content'],
        PARTICIPANT: ['view_content', 'participate']
      };

      const userRoles = req.userRoles || [];
      const userPermissions = userRoles.flatMap(
        role => rolePermissions[role] || []
      );

      if (!userPermissions.includes(permission)) {
        return res.status(403).json({
          message: 'Insufficient permissions',
          required: permission,
          userPermissions
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);

      return res.status(500).json({
        message: 'Permission check failed',
        error: error.message
      });
    }
  };
};

module.exports = {
  requireRole,
  requireAdmin,
  requirePermission
};
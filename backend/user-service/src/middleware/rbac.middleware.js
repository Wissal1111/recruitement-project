const prisma = require('../config/prisma');

/**
 * Middleware to check if user has required role(s)
 * @param {string|string[]} requiredRoles - Single role or array of roles
 * @param {boolean} requireAll - If true, user must have ALL roles; if false, ANY role
 */
const requireRole = (requiredRoles, requireAll = false) => {
  return async (req, res, next) => {
    try {
      const userRoles = await prisma.userRole.findMany({
        where: { userId: req.userId },
        
        include: { role: true },
        select: { role: { select: { name: true } } }
      });
      console.log("USER ID:", req.userId);
      console.log("USER ROLES:", userRoles);


      const userRoleNames = userRoles.map(ur => ur.role.name);

      if (requireAll) {
        // User must have ALL required roles
        const hasAllRoles = Array.isArray(requiredRoles)
          ? requiredRoles.every(role => userRoleNames.includes(role))
          : userRoleNames.includes(requiredRoles);

        if (!hasAllRoles) {
          return res.status(403).json({
            message: 'Insufficient permissions - missing required role(s)',
            required: Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles],
            userRoles: userRoleNames
          });
        }
      } else {
        // User must have ANY of the required roles
        const hasAnyRole = Array.isArray(requiredRoles)
          ? requiredRoles.some(role => userRoleNames.includes(role))
          : userRoleNames.includes(requiredRoles);

        if (!hasAnyRole) {
          return res.status(403).json({
            message: 'Insufficient permissions - missing required role',
            required: Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles],
            userRoles: userRoleNames
          });
        }
      }

      // Attach user roles to request for later use
      req.userRoles = userRoleNames;
      next();
    } catch (error) {
       console.log("USER ID:", req.userId);
      console.log("USER ROLES:", userRoles);
      console.error('Role authorization error:', error);
      res.status(500).json({ message: 'Authorization check failed' });
    }
  };
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = requireRole('ADMIN');

/**
 * Middleware to check if user has specific permission
 * @param {string} permission - Permission to check
 */
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      // For now, map permissions to roles
      // This can be extended with a proper permissions system
      const rolePermissions = {
        'ADMIN': ['manage_users', 'manage_roles', 'view_all'],
        'CREATOR': ['create_content', 'edit_own_content'],
        'PARTICIPANT': ['view_content', 'participate']
      };

      const userRoles = req.userRoles || [];
      const userPermissions = userRoles.flatMap(role => rolePermissions[role] || []);

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
      res.status(500).json({ message: 'Permission check failed' });
    }
  };
};

module.exports = {
  requireRole,
  requireAdmin,
  requirePermission
};
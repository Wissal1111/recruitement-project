const router = require('express').Router();
const ctrl = require('../controllers/role.controller');
const auth = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/rbac.middleware');
const roleValidation = require('../middleware/role.middleware');


// US-18: Get roles list (Low priority - public access for now)✔
router.get('/', ctrl.getRoles);

// Get current user's roles✔
router.get('/me', auth, ctrl.getMyRoles);
router.post('/me/creator', auth, ctrl.addCreatorRoleToMe);

// Get specific user's roles (admin only)✔
router.get('/user/:userId', auth, ctrl.getUserRoles);


// add role creator to user
// hadi drtha ana (malek)

router.post('/become-creator', auth, ctrl.becomeCreator);


// Remove role from user (admin only)
router.post(
  '/remove',
  auth,
  requireAdmin,
  roleValidation.validateRolePayload,
  roleValidation.loadUserById,
  roleValidation.loadRoleByName,
  roleValidation.ensureAssigned,
  ctrl.removeRole
);

module.exports = router;

const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/logout', auth, ctrl.logout);
router.post('/refresh-token', ctrl.refreshToken);

router.put('/change-password', auth, ctrl.changePassword);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);
module.exports = router;

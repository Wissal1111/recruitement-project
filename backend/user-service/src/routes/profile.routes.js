const router = require('express').Router();
const ctrl = require('../controllers/profile.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, ctrl.getProfile);
router.put('/', auth, ctrl.updateProfile);

module.exports = router;
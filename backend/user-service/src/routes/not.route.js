const router = require('express').Router();
const ctrl = require('../controllers/not');
const auth = require('../middleware/auth.middleware');
router.get('/', auth, ctrl.getNotificationss); // GET /api/notifications
module.exports = router;
const router = require('express').Router();
const ctrl = require('../controllers/notification.controller');
const auth = require('../middleware/auth.middleware');

router.post('/test', auth, ctrl.sendTestNotification); // POST /api/notifications/test
router.post('/', ctrl.createNotification); // POST /api/notifications
router.get('/', auth, ctrl.getNotifications); // GET /api/notifications
router.put('/:id', auth, ctrl.markAsRead); // PUT /api/notifications/:id

module.exports = router;
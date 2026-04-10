const router = require('express').Router();
const ctrl = require('../controllers/interest.controller');
const auth = require('../middleware/auth.middleware');
const interestMiddleware = require('../middleware/interest.middleware');

router.get('/all', auth, ctrl.getAllInterests);   // ← must be FIRST
router.get('/', auth, ctrl.getUserInterests);
router.post('/', auth, ctrl.addUserInterest);
router.put('/', auth, interestMiddleware.validateInterestIds, interestMiddleware.ensureInterestsExist, ctrl.updateUserInterests);
router.delete('/:id', auth, ctrl.deleteUserInterest);

module.exports = router;
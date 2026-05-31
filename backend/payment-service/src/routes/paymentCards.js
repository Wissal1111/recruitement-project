const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
  createPaymentCard,
  listPaymentCards,
  findPaymentCard,
  updatePaymentCard,
  deletePaymentCard,
  checkCardBudget,
} = require('../services/paymentCardService');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const card = await createPaymentCard(req.user.userId, req.body);
    res.json(card);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/user/', authMiddleware, async (req, res) => {
  try {
    const cards = await listPaymentCards(req.user.userId);
    res.json(cards);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:cardId/user', authMiddleware, async (req, res) => {
  try {
    const card = await findPaymentCard(req.params.cardId, req.user.userId);
    res.json(card);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:cardId/user', authMiddleware, async (req, res) => {
  try {
    const card = await updatePaymentCard(req.params.cardId, req.user.userId, req.body);
    res.json(card);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:cardId/user', authMiddleware, async (req, res) => {
  try {
    const card = await deletePaymentCard(req.params.cardId, req.user.userId);
    res.json(card);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:cardId/budget', authMiddleware, async (req, res) => {
  try {
    const budget = await checkCardBudget(req.params.cardId);
    res.json(budget);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
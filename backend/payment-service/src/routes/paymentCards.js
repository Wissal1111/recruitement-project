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
    console.log('CREATE CARD - user:', req.user);
    console.log('CREATE CARD - body:', req.body);
    const card = await createPaymentCard(req.user.userId, req.body);
    res.json(card);
  } catch (error) {
    console.error('CREATE CARD ERROR:', error.message);
    console.error('CREATE CARD STACK:', error.stack);
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


// ✅ Add money to card balance (simulated withdrawal)
router.put('/:cardId/add-balance', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const card = await prisma.paymentCard.findFirst({
      where: { id: Number(req.params.cardId) }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // ✅ Add money to card's automaticBudget (simulates receiving money)
    const updated = await prisma.paymentCard.update({
      where: { id: card.id },
      data: {
        automaticBudget: { increment: Number(amount) }
      }
    });

    res.json({
      success: true,
      cardName: updated.cardName,
      newBalance: updated.automaticBudget,
      added: amount
    });
  } catch (error) {
    console.error('Add balance error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmOrder } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create-intent', authMiddleware, createPaymentIntent);
router.post('/confirm-order', authMiddleware, confirmOrder);

module.exports = router;
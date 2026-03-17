const express = require('express');
const router = express.Router();
const { checkout, getOrders, getOrder } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/checkout', authMiddleware, checkout);
router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrder);

module.exports = router;
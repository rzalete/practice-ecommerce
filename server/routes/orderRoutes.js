const express = require('express');
const router = express.Router();
const { checkout, getOrders, getOrder, updateOrderStatus, getAllOrders } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/checkout', authMiddleware, checkout);
router.get('/', authMiddleware, getOrders);
router.get('/admin', authMiddleware, roleMiddleware('admin'), getAllOrders);
router.get('/:id', authMiddleware, getOrder);
router.patch('/:id/status', authMiddleware, roleMiddleware('admin'), updateOrderStatus);

module.exports = router;
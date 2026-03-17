const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');
const { addToCartValidation, updateCartValidation } = require('../middleware/cartValidation');
const validateRequest = require('../middleware/validateRequest');

router.get('/', authMiddleware, getCart);
router.post('/', authMiddleware, addToCartValidation, validateRequest, addToCart);
router.put('/:id', authMiddleware, updateCartValidation, validateRequest, updateCartItem);
router.delete('/:id', authMiddleware, removeFromCart);
router.delete('/', authMiddleware, clearCart);

module.exports = router;
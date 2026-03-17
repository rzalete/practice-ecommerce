const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { productValidation } = require('../middleware/productValidation');
const validateRequest = require('../middleware/validateRequest');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authMiddleware, roleMiddleware('admin'), productValidation, validateRequest, createProduct);
router.put('/:id', authMiddleware, roleMiddleware('admin'), productValidation, validateRequest, updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteProduct);

module.exports = router;
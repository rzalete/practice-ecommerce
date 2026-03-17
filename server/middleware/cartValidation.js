const { body } = require('express-validator');

const addToCartValidation = [
    body('product_id')
        .notEmpty()
        .withMessage('Product ID is required')
        .isInt({ min: 1 })
        .withMessage('Product ID must be a valid integer'),

    body('quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
];

const updateCartValidation = [
    body('quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
];

module.exports = { addToCartValidation, updateCartValidation };
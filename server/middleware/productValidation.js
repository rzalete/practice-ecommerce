const { body } = require('express-validator');

const productValidation = [
    body('name')
        .notEmpty()
        .withMessage('Product name is required'),

    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('stock')
        .isInt({ min: 0 })
        .withMessage('Stock must be a positive integer'),
];

module.exports = { productValidation };
const pool = require('../config/db');

// Get all products
const getProducts = async (req, res) => {
    const { search, minPrice, maxPrice, sort } = req.query;

    try {
        const conditions = [];
        const params = [];

        if (search?.trim()) {
            params.push(`%${search.trim()}%`);
            conditions.push(`name ILIKE $${params.length}`);
        }

        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);

        if (!isNaN(min)) {
            params.push(min);
            conditions.push(`price >= $${params.length}`);
        }

        if (!isNaN(max)) {
            params.push(max);
            conditions.push(`price <= $${params.length}`);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const orderBy = {
            price_asc: 'ORDER BY price ASC',
            price_desc: 'ORDER BY price DESC',
            newest: 'ORDER BY created_at DESC',
        }[sort] || 'ORDER BY created_at DESC';

        const products = await pool.query(
            `SELECT * FROM products ${where} ${orderBy}`,
            params
        );

        res.status(200).json(products.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single product
const getProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (product.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create product (admin only)
const createProduct = async (req, res) => {
    const { name, description, price, stock, image_url } = req.body;
    try {
        const newProduct = await pool.query(
            'INSERT INTO products (name, description, price, stock, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, price, stock, image_url]
        );
        res.status(201).json(newProduct.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update product (admin only)
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, image_url } = req.body;
    try {
        const updatedProduct = await pool.query(
            'UPDATE products SET name=$1, description=$2, price=$3, stock=$4, image_url=$5 WHERE id=$6 RETURNING *',
            [name, description, price, stock, image_url, id]
        );
        if (updatedProduct.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(updatedProduct.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete product (admin only)
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await pool.query('DELETE FROM products WHERE id=$1 RETURNING *', [id]);
        if (deletedProduct.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
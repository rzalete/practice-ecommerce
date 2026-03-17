const pool = require('../config/db');

// Get cart items for logged in user
const getCart = async (req, res) => {
    try {
        const cart = await pool.query(
            `SELECT cart.id, products.name, products.price, cart.quantity, 
      (products.price * cart.quantity) AS total
      FROM cart 
      JOIN products ON cart.product_id = products.id
      WHERE cart.user_id = $1`,
            [req.user.id]
        );
        res.status(200).json(cart.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add item to cart
const addToCart = async (req, res) => {
    const { product_id, quantity } = req.body;
    try {
        // Cek apakah produk sudah ada di cart
        const existingItem = await pool.query(
            'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
            [req.user.id, product_id]
        );

        if (existingItem.rows.length > 0) {
            // Update quantity kalau sudah ada
            const updatedItem = await pool.query(
                'UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
                [quantity, req.user.id, product_id]
            );
            return res.status(200).json(updatedItem.rows[0]);
        }

        // Tambah item baru ke cart
        const newItem = await pool.query(
            'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, product_id, quantity]
        );
        res.status(201).json(newItem.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedItem = await pool.query(
            'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );
        if (deletedItem.rows.length === 0) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
        res.status(200).json({ message: 'Item removed from cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Clear cart
const clearCart = async (req, res) => {
    try {
        await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
        res.status(200).json({ message: 'Cart cleared' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    try {
        if (quantity <= 0) {
            return res.status(400).json({ message: 'Quantity must be greater than 0' });
        }

        const updatedItem = await pool.query(
            'UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [quantity, id, req.user.id]
        );

        if (updatedItem.rows.length === 0) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        res.status(200).json(updatedItem.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
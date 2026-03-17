const pool = require('../config/db');

// Checkout - create order from cart
const checkout = async (req, res) => {
    const client = await pool.connect();
    try {
        // Ambil semua item di cart user
        const cartItems = await client.query(
            `SELECT cart.*, products.price, products.stock 
       FROM cart 
       JOIN products ON cart.product_id = products.id
       WHERE cart.user_id = $1`,
            [req.user.id]
        );

        if (cartItems.rows.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Hitung total amount
        const totalAmount = cartItems.rows.reduce((sum, item) => {
            return sum + item.price * item.quantity;
        }, 0);

        await client.query('BEGIN');

        // Buat order baru
        const newOrder = await client.query(
            'INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING *',
            [req.user.id, totalAmount]
        );

        const orderId = newOrder.rows[0].id;

        // Masukkan setiap item cart ke order_items
        for (const item of cartItems.rows) {
            // Cek stock
            if (item.stock < item.quantity) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Insufficient stock for product ${item.product_id}` });
            }

            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [orderId, item.product_id, item.quantity, item.price]
            );

            // Kurangi stock produk
            await client.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }

        // Kosongkan cart
        await client.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

        await client.query('COMMIT');

        res.status(201).json(newOrder.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

// Get order history for logged in user
const getOrders = async (req, res) => {
    try {
        const orders = await pool.query(
            'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.status(200).json(orders.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single order detail
const getOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await pool.query(
            'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (order.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const orderItems = await pool.query(
            `SELECT order_items.*, products.name 
       FROM order_items 
       JOIN products ON order_items.product_id = products.id
       WHERE order_items.order_id = $1`,
            [id]
        );

        res.status(200).json({
            ...order.rows[0],
            items: orderItems.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { checkout, getOrders, getOrder };
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/db');

const createPaymentIntent = async (req, res) => {
    try {
        const cartItems = await pool.query(
            `SELECT cart.*, products.price, products.name, products.stock
             FROM cart
             JOIN products ON cart.product_id = products.id
             WHERE cart.user_id = $1`,
            [req.user.id]
        );

        if (cartItems.rows.length === 0)
            return res.status(400).json({ message: 'Cart is empty' });

        const totalAmount = cartItems.rows.reduce(
            (sum, item) => sum + Math.round(item.price * item.quantity * 100), 0
        );

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'usd',
            metadata: { user_id: String(req.user.id) }
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            totalAmount: totalAmount / 100
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const confirmOrder = async (req, res) => {
    const { paymentIntentId } = req.body;
    const client = await pool.connect();

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded')
            return res.status(400).json({ message: 'Payment not completed' });

        const existing = await pool.query(
            'SELECT * FROM orders WHERE payment_intent_id = $1',
            [paymentIntentId]
        );
        if (existing.rows.length > 0)
            return res.status(400).json({ message: 'Order already created' });

        const cartItems = await client.query(
            `SELECT cart.*, products.price, products.stock
             FROM cart
             JOIN products ON cart.product_id = products.id
             WHERE cart.user_id = $1
             FOR UPDATE`,
            [req.user.id]
        );

        if (cartItems.rows.length === 0)
            return res.status(400).json({ message: 'Cart is empty' });

        const totalAmount = cartItems.rows.reduce(
            (sum, item) => sum + item.price * item.quantity, 0
        );

        await client.query('BEGIN');

        const newOrder = await client.query(
            'INSERT INTO orders (user_id, total_amount, status, payment_intent_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.id, totalAmount, 'processing', paymentIntentId]
        );
        const orderId = newOrder.rows[0].id;

        for (const item of cartItems.rows) {
            if (item.stock < item.quantity) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Insufficient stock for product ${item.product_id}` });
            }
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [orderId, item.product_id, item.quantity, item.price]
            );
            await client.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }

        await client.query(
            'INSERT INTO order_status_history (order_id, status, changed_by) VALUES ($1, $2, $3)',
            [orderId, 'processing', req.user.id]
        );

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

module.exports = { createPaymentIntent, confirmOrder };
const pool = require('../config/db');

const VALID_TRANSITIONS = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: []
};

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

const getOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const query = req.user.role === 'admin'
            ? 'SELECT * FROM orders WHERE id = $1'
            : 'SELECT * FROM orders WHERE id = $1 AND user_id = $2';
        const params = req.user.role === 'admin' ? [id] : [id, req.user.id];

        const order = await pool.query(query, params);
        if (order.rows.length === 0)
            return res.status(404).json({ message: 'Order not found' });

        const [items, history] = await Promise.all([
            pool.query(
                `SELECT order_items.*, products.name 
                 FROM order_items 
                 JOIN products ON order_items.product_id = products.id
                 WHERE order_items.order_id = $1`,
                [id]
            ),
            pool.query(
                `SELECT order_status_history.*, users.email as changed_by_email
                 FROM order_status_history
                 JOIN users ON order_status_history.changed_by = users.id
                 WHERE order_id = $1 
                 ORDER BY changed_at ASC`,
                [id]
            )
        ]);

        res.status(200).json({
            ...order.rows[0],
            items: items.rows,
            history: history.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const order = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (order.rows.length === 0)
            return res.status(404).json({ message: 'Order not found' });

        const currentStatus = order.rows[0].status;
        const allowed = VALID_TRANSITIONS[currentStatus];

        if (!allowed.includes(status)) {
            return res.status(400).json({
                message: `Cannot transition from '${currentStatus}' to '${status}'`
            });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
            await client.query(
                'INSERT INTO order_status_history (order_id, status, changed_by) VALUES ($1, $2, $3)',
                [id, status, req.user.id]
            );
            await client.query('COMMIT');
            res.status(200).json({ message: 'Status updated', status });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await pool.query(
            `SELECT orders.*, users.email 
             FROM orders 
             JOIN users ON orders.user_id = users.id
             ORDER BY created_at DESC`
        );
        res.status(200).json(orders.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getOrders, getOrder, updateOrderStatus, getAllOrders };
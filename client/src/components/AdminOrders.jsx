import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const STATUS_STYLES = {
    pending: { color: '#a3a3a3', bg: 'rgba(163,163,163,0.08)' },
    processing: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
    shipped: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    delivered: { color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
    cancelled: { color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
};

const VALID_TRANSITIONS = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
};

function StatusBadge({ status }) {
    const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
    return (
        <span style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}22` }}
            className="text-xs px-2 py-1 rounded capitalize">
            {status}
        </span>
    );
}

function AdminOrders({ token }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await api.get('/api/orders/admin', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch {
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const updateStatus = async (orderId, newStatus) => {
        setUpdating(orderId);
        try {
            await api.patch(`/api/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: newStatus } : o
            ));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return <p className="text-[#737373] text-sm py-10 text-center">Loading...</p>;
    if (error) return <p className="text-red-400 text-sm py-10 text-center">{error}</p>;

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <p className="text-xs text-[#737373]">{orders.length} orders</p>
            </div>

            {orders.length === 0 ? (
                <p className="text-[#737373] text-sm">No orders yet.</p>
            ) : (
                <div className="space-y-3">
                    {orders.map(order => {
                        const nextStatuses = VALID_TRANSITIONS[order.status] || [];
                        return (
                            <div key={order.id} className="product-row rounded-lg px-5 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="text-xs text-[#737373] mb-1">Order #{order.id}</p>
                                            <p className="text-xs text-[#a3a3a3]">{order.email}</p>
                                        </div>
                                        <p style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-sm text-[#f5f5f5]">
                                            ${parseFloat(order.total_amount).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={order.status} />
                                        {nextStatuses.length > 0 ? (
                                            <select className="status-select" defaultValue=""
                                                disabled={updating === order.id}
                                                onChange={e => {
                                                    if (e.target.value) updateStatus(order.id, e.target.value);
                                                    e.target.value = '';
                                                }}>
                                                <option value="" disabled>update →</option>
                                                {nextStatuses.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-xs text-[#3a3a3a]">—</span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-[#3a3a3a] mt-2">
                                    {new Date(order.created_at).toLocaleDateString('en-GB')}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}

export default AdminOrders;
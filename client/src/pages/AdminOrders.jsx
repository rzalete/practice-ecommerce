import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

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

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) { window.location.href = '/login'; return; }
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders/admin', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        setUpdating(orderId);
        try {
            await axios.patch(`/api/orders/${orderId}/status`,
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

    if (loading) return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
            <p className="text-[#737373] text-sm">Loading...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
            <p className="text-red-400 text-sm">{error}</p>
        </div>
    );

    return (
        <div style={{ fontFamily: "'DM Mono', monospace" }} className="min-h-screen bg-[#0f0f0f] px-6 py-10">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');
                .order-row { background: #161616; border: 1px solid #252525; transition: border-color 0.2s; }
                .order-row:hover { border-color: #3a3a3a; }
                .status-select {
                    background: #0f0f0f;
                    border: 1px solid #252525;
                    color: #a3a3a3;
                    font-family: 'DM Mono', monospace;
                    font-size: 12px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    outline: none;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }
                .status-select:hover { border-color: #3a3a3a; }
                .status-select:disabled { opacity: 0.4; cursor: not-allowed; }
            `}</style>
            <Navbar />

            <div className="max-w-3xl mx-auto mt-10">
                <div className="flex items-center justify-between mb-10">
                    <h1 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-xl font-light text-[#f5f5f5]">
                        All Orders
                    </h1>
                    <p className="text-xs text-[#737373]">{orders.length} orders</p>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-[#737373] text-sm">No orders yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map(order => {
                            const nextStatuses = VALID_TRANSITIONS[order.status] || [];
                            return (
                                <div key={order.id} className="order-row rounded-lg px-5 py-4">
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
                                                <select
                                                    className="status-select"
                                                    defaultValue=""
                                                    disabled={updating === order.id}
                                                    onChange={e => {
                                                        if (e.target.value) updateStatus(order.id, e.target.value);
                                                        e.target.value = '';
                                                    }}
                                                >
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
            </div>
        </div>
    );
}

export default AdminOrders;
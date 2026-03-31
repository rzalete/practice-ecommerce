import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { X, Package } from 'lucide-react';

const STATUS_STYLES = {
    pending: { color: '#a3a3a3', bg: 'rgba(163,163,163,0.08)', label: 'Pending' },
    processing: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', label: 'Processing' },
    shipped: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'Shipped' },
    delivered: { color: '#34d399', bg: 'rgba(52,211,153,0.08)', label: 'Delivered' },
    cancelled: { color: '#f87171', bg: 'rgba(248,113,113,0.08)', label: 'Cancelled' },
};

function StatusBadge({ status }) {
    const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
    return (
        <span style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}22` }}
            className="text-xs px-2 py-1 rounded">
            {s.label}
        </span>
    );
}

function Orders() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) { window.location.href = '/login'; return; }
        fetchOrders();
    }, []);

    useEffect(() => {
        if (!token) { window.location.href = '/login'; return; }
        fetchOrders();
    }, [token, fetchOrders]);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await api.get('/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchOrderDetail = async (id) => {
        try {
            const res = await api.get(`/api/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedOrder(res.data);
        } catch (err) {
            alert('Failed to load order detail');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
            <p className="text-[#737373] text-sm tracking-wide">Loading...</p>
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
                .order-row { background: #161616; border: 1px solid #252525; transition: border-color 0.2s; cursor: pointer; }
                .order-row:hover { border-color: #3a3a3a; }
                .order-detail { background: #161616; border: 1px solid #252525; }
                .timeline-line { border-left: 1px solid #252525; }
            `}</style>
            <Navbar />

            <div className="max-w-2xl mx-auto mt-10">
                <h1 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-xl font-light text-[#f5f5f5] mb-10">
                    Orders
                </h1>

                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <Package size={32} className="text-[#3a3a3a] mx-auto mb-4" />
                        <p className="text-[#737373] text-sm mb-4">No orders yet.</p>
                        <a href="/" className="text-xs text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors">
                            Browse products →
                        </a>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map(order => (
                            <div key={order.id} className="order-row rounded-lg px-5 py-4"
                                onClick={() => fetchOrderDetail(order.id)}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-[#737373] mb-1">Order #{order.id}</p>
                                        <p style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-sm text-[#f5f5f5]">
                                            ${parseFloat(order.total_amount).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <StatusBadge status={order.status} />
                                        <p className="text-xs text-[#3a3a3a] mt-2">
                                            {new Date(order.created_at).toLocaleDateString('en-GB')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Order Detail Modal */}
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center px-4 z-50"
                        onClick={() => setSelectedOrder(null)}>
                        <div className="order-detail rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}>

                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-sm font-medium text-[#f5f5f5]">
                                        Order #{selectedOrder.id}
                                    </h2>
                                    <p className="text-xs text-[#737373] mt-1">
                                        {new Date(selectedOrder.created_at).toLocaleDateString('en-GB')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={selectedOrder.status} />
                                    <button className="text-[#3a3a3a] hover:text-[#f5f5f5] transition-colors"
                                        onClick={() => setSelectedOrder(null)}>
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-3 mb-6">
                                {selectedOrder.items.map(item => (
                                    <div key={item.product_id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-[#f5f5f5]">{item.name}</p>
                                            <p className="text-xs text-[#737373]">x{item.quantity}</p>
                                        </div>
                                        <p className="text-sm text-[#a3a3a3]">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="border-t border-[#252525] pt-4 flex items-center justify-between mb-6">
                                <p className="text-xs text-[#737373]">Total</p>
                                <p style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-sm text-[#f5f5f5]">
                                    ${parseFloat(selectedOrder.total_amount).toFixed(2)}
                                </p>
                            </div>

                            {/* Status History */}
                            {selectedOrder.history?.length > 0 && (
                                <div>
                                    <p className="text-xs text-[#737373] mb-4">History</p>
                                    <div className="space-y-4">
                                        {selectedOrder.history.map((h, i) => {
                                            const s = STATUS_STYLES[h.status] || STATUS_STYLES.pending;
                                            return (
                                                <div key={h.id} className="flex gap-3">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                                                            style={{ background: s.color }} />
                                                        {i < selectedOrder.history.length - 1 && (
                                                            <div className="w-px flex-1 mt-1" style={{ background: '#252525' }} />
                                                        )}
                                                    </div>
                                                    <div className="pb-4">
                                                        <p className="text-xs" style={{ color: s.color }}>{s.label}</p>
                                                        <p className="text-xs text-[#3a3a3a] mt-0.5">
                                                            {new Date(h.changed_at).toLocaleString('en-GB')}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Orders;
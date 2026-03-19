import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            window.location.href = '/login';
            return;
        }
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetail = async (id) => {
        try {
            const res = await axios.get(`/api/orders/${id}`, {
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .order-row {
          background: #161616;
          border: 1px solid #252525;
          transition: border-color 0.2s;
          cursor: pointer;
        }
        .order-row:hover { border-color: #3a3a3a; }
        .order-detail {
          background: #161616;
          border: 1px solid #252525;
        }
        .close-btn {
          color: #3a3a3a;
          transition: color 0.2s;
        }
        .close-btn:hover { color: #f5f5f5; }
      `}</style>
            <Navbar />

            <div className="max-w-2xl mx-auto mt-10">
                <h1 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-xl font-light text-[#f5f5f5] mb-10">
                    Orders
                </h1>
                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-[#737373] text-sm mb-4">No orders yet.</p>
                        <a href="/" className="text-xs text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors">
                            Browse products →
                        </a>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map(order => (
                            <div
                                key={order.id}
                                className="order-row rounded-lg px-5 py-4"
                                onClick={() => fetchOrderDetail(order.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-[#737373] mb-1">Order #{order.id}</p>
                                        <p style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-sm text-[#f5f5f5]">
                                            ${parseFloat(order.total_amount).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-[#737373] border border-[#252525] px-2 py-1 rounded">
                                            {order.status}
                                        </span>
                                        <p className="text-xs text-[#3a3a3a] mt-2">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Order Detail Modal */}
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center px-4 z-50">
                        <div className="order-detail rounded-lg p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-6">
                                <h2 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-sm font-medium text-[#f5f5f5]">
                                    Order #{selectedOrder.id}
                                </h2>
                                <button className="close-btn text-xs" onClick={() => setSelectedOrder(null)}>close</button>
                            </div>

                            <div className="space-y-3 mb-6">
                                {selectedOrder.items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between">
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

                            <div className="border-t border-[#252525] pt-4 flex items-center justify-between">
                                <p className="text-xs text-[#737373]">Total</p>
                                <p style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-sm text-[#f5f5f5]">
                                    ${parseFloat(selectedOrder.total_amount).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Orders;
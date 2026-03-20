import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

function Cart() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            window.location.href = '/login';
            return;
        }
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const res = await api.get('/api/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(res.data);
        } catch (err) {
            setError('Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (id, quantity) => {
        if (quantity < 1) return;
        try {
            await api.put(`/api/cart/${id}`, { quantity }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCart();
        } catch (err) {
            alert('Failed to update quantity');
        }
    };

    const removeItem = async (id) => {
        try {
            await api.delete(`/api/cart/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCart();
        } catch (err) {
            alert('Failed to remove item');
        }
    };

    const checkout = async () => {
        try {
            await api.post('/api/orders/checkout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            window.location.href = '/orders';
        } catch (err) {
            alert(err.response?.data?.message || 'Checkout failed');
        }
    };

    const total = cart.reduce((sum, item) => sum + parseFloat(item.total), 0);

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
        .cart-item {
          background: #161616;
          border: 1px solid #252525;
        }
        .qty-btn {
          background: transparent;
          border: 1px solid #252525;
          color: #737373;
          transition: all 0.2s;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .qty-btn:hover {
          border-color: #a3a3a3;
          color: #f5f5f5;
        }
        .remove-btn {
          color: #3a3a3a;
          transition: color 0.2s;
          font-size: 11px;
        }
        .remove-btn:hover { color: #ef4444; }
        .checkout-btn {
          background: #f5f5f5;
          color: #0f0f0f;
          transition: background 0.2s;
        }
        .checkout-btn:hover { background: #fff; }
      `}</style>

            <Navbar />

            <div className="max-w-2xl mx-auto mt-10">
                <h1 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-xl font-light text-[#f5f5f5] mb-10">
                    Cart
                </h1>
                {cart.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-[#737373] text-sm mb-4">Your cart is empty.</p>
                        <a href="/" className="text-xs text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors">
                            Browse products →
                        </a>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="space-y-3 mb-8">
                            {cart.map(item => (
                                <div key={item.id} className="cart-item rounded-lg px-5 py-4 flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h2 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-sm text-[#f5f5f5] font-medium mb-1">
                                            {item.name}
                                        </h2>
                                        <p className="text-xs text-[#a3a3a3]">${item.price} each</p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2">
                                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                                        <span className="text-sm text-[#f5f5f5] w-6 text-center">{item.quantity}</span>
                                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                    </div>

                                    {/* Total & Remove */}
                                    <div className="text-right">
                                        <p className="text-sm text-[#a3a3a3] mb-1">${parseFloat(item.total).toFixed(2)}</p>
                                        <button className="remove-btn" onClick={() => removeItem(item.id)}>remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="border-t border-[#1f1f1f] pt-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-[#737373] mb-1">Total</p>
                                <p style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-xl font-light text-[#f5f5f5]">
                                    ${total.toFixed(2)}
                                </p>
                            </div>
                            <button onClick={checkout} className="checkout-btn px-8 py-3 rounded text-sm font-medium tracking-wide">
                                Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Cart;
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Minus, Plus, Trash2, CheckCircle } from 'lucide-react';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// ─── Payment Form ───────────────────────────────────────────
function PaymentForm({ clientSecret, onSuccess, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setPaying(true);
        setError('');

        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required'
        });

        if (stripeError) {
            setError(stripeError.message);
            setPaying(false);
            return;
        }

        if (paymentIntent.status === 'succeeded') {
            await onSuccess(paymentIntent.id);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            {error && (
                <p className="text-red-400 text-xs">{error}</p>
            )}
            <div className="flex gap-3">
                <button type="submit" disabled={!stripe || paying}
                    className="checkout-btn flex-1 py-3 rounded text-sm font-medium tracking-wide disabled:opacity-50">
                    {paying ? 'Processing...' : 'Pay now'}
                </button>
                <button type="button" onClick={onCancel}
                    className="px-4 py-3 rounded text-xs text-[#737373] border border-[#252525] hover:text-[#f5f5f5] hover:border-[#3a3a3a] transition-colors">
                    Cancel
                </button>
            </div>
        </form>
    );
}

// ─── Cart ───────────────────────────────────────────────────
function Cart() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [clientSecret, setClientSecret] = useState(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const token = localStorage.getItem('token');

    const fetchCart = useCallback(async () => {
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
    }, [token]);

    useEffect(() => {
        if (!token) { window.location.href = '/login'; return; }
        fetchCart();
    }, [token, fetchCart]);

    const updateQuantity = async (id, quantity) => {
        if (quantity < 1) return;
        try {
            await api.put(`/api/cart/${id}`, { quantity }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCart();
        } catch {
            alert('Failed to update quantity');
        }
    };

    const removeItem = async (id) => {
        try {
            await api.delete(`/api/cart/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCart();
        } catch {
            alert('Failed to remove item');
        }
    };

    const handleCheckout = async () => {
        setCheckoutLoading(true);
        try {
            const res = await api.post('/api/payment/create-intent', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClientSecret(res.data.clientSecret);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to initialize payment');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handlePaymentSuccess = async (paymentIntentId) => {
        try {
            await api.post('/api/payment/confirm-order', { paymentIntentId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClientSecret(null);
            setCart([]);
            setShowSuccess(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to confirm order');
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
                .cart-item { background: #161616; border: 1px solid #252525; }
                .qty-btn { background: transparent; border: 1px solid #252525; color: #737373; transition: all 0.2s; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 4px; }
                .qty-btn:hover { border-color: #a3a3a3; color: #f5f5f5; }
                .remove-btn { color: #3a3a3a; transition: color 0.2s; font-size: 11px; }
                .remove-btn:hover { color: #ef4444; }
                .checkout-btn { background: #f5f5f5; color: #0f0f0f; transition: background 0.2s; }
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
                                        <h2 style={{ fontFamily: "'DM Sans', sans-serif" }}
                                            className="text-sm text-[#f5f5f5] font-medium mb-1">{item.name}</h2>
                                        <p className="text-xs text-[#a3a3a3]">${item.price} each</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}> <Minus size={12} /> </button>
                                        <span className="text-sm text-[#f5f5f5] w-6 text-center">{item.quantity}</span>
                                        <div className="relative group">
                                            <button
                                                className="qty-btn"
                                                disabled={item.quantity >= item.stock}
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                <Plus size={12} />
                                            </button>
                                            {item.quantity >= item.stock && (
                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-[#737373] whitespace-nowrap bg-[#1f1f1f] border border-[#252525] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Max stock reached
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-[#a3a3a3] mb-1">${parseFloat(item.total).toFixed(2)}</p>
                                        <button className="remove-btn" onClick={() => removeItem(item.id)}> <Trash2 size={13} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="border-t border-[#1f1f1f] pt-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-xs text-[#737373] mb-1">Total</p>
                                    <p style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-xl font-light text-[#f5f5f5]">
                                        ${total.toFixed(2)}
                                    </p>
                                </div>
                                {!clientSecret && (
                                    <button onClick={handleCheckout} disabled={checkoutLoading}
                                        className="checkout-btn px-8 py-3 rounded text-sm font-medium tracking-wide disabled:opacity-50">
                                        {checkoutLoading ? 'Loading...' : 'Checkout'}
                                    </button>
                                )}
                            </div>

                            {/* Stripe Payment Element */}
                            {clientSecret && (
                                <div className="bg-[#161616] border border-[#252525] rounded-lg p-6">
                                    <p style={{ fontFamily: "'DM Sans', sans-serif" }}
                                        className="text-sm text-[#f5f5f5] mb-6">Payment</p>
                                    <Elements stripe={stripePromise} options={{
                                        clientSecret,
                                        appearance: {
                                            theme: 'night',
                                            variables: {
                                                colorBackground: '#161616',
                                                colorText: '#f5f5f5',
                                                colorTextPlaceholder: '#3a3a3a',
                                                colorPrimary: '#f5f5f5',
                                                borderRadius: '6px',
                                                fontFamily: 'DM Mono, monospace',
                                            }
                                        }
                                    }}>
                                        <PaymentForm
                                            clientSecret={clientSecret}
                                            onSuccess={handlePaymentSuccess}
                                            onCancel={() => setClientSecret(null)}
                                        />
                                    </Elements>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {showSuccess && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center px-4 z-50">
                    <div className="bg-[#161616] border border-[#252525] rounded-lg p-8 w-full max-w-sm text-center">
                        <p className="text-2xl mb-4 text-green-500"><CheckCircle size={32} className="text-green-500 mx-auto mb-4" /></p>
                        <h2 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-sm font-medium text-[#f5f5f5] mb-2">
                            Payment successful
                        </h2>
                        <p className="text-xs text-[#737373] mb-6">Your order has been placed.</p>
                        <div className="flex gap-3">
                            <a href="/orders"
                                className="flex-1 py-2 rounded text-xs text-[#737373] border border-[#252525] hover:text-[#f5f5f5] hover:border-[#3a3a3a] transition-colors">
                                View orders
                            </a>
                            <button onClick={() => setShowSuccess(false)}
                                className="checkout-btn flex-1 py-2 rounded text-xs font-medium">
                                Continue shopping
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;
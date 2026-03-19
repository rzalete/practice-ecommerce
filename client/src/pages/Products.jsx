import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addedId, setAddedId] = useState(null);
    const token = localStorage.getItem('token');

    const getRole = () => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('/api/products');
                setProducts(res.data);
            } catch (err) {
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const addToCart = async (productId) => {
        if (!token) {
            window.location.href = '/login';
            return;
        }
        try {
            await axios.post('/api/cart', { product_id: productId, quantity: 1 }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddedId(productId);
            setTimeout(() => setAddedId(null), 1500);
        } catch (err) {
            alert('Failed to add to cart');
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        window.location.reload();
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
        .product-card {
          background: #161616;
          border: 1px solid #252525;
          transition: border-color 0.2s, background 0.2s;
        }
        .product-card:hover {
          border-color: #3a3a3a;
          background: #1a1a1a;
        }
        .add-btn {
          background: transparent;
          border: 1px solid #2a2a2a;
          color: #737373;
          transition: all 0.2s;
        }
        .add-btn:hover {
          border-color: #a3a3a3;
          color: #f5f5f5;
        }
        .add-btn.added {
          border-color: #a3a3a3;
          color: #a3a3a3;
        }
      `}</style>


            <Navbar />
            <div className="max-w-6xl mx-auto mt-10">
                <h1 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-xl font-light text-[#f5f5f5] mb-10">
                    All Products
                </h1>
                {/* Products Grid */}
                {products.length === 0 ? (
                    <p className="text-[#737373] text-sm">No products available.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {products.map(product => (
                            <div key={product.id} className="product-card rounded-lg p-5 flex flex-col">
                                {product.image_url && (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-36 object-cover rounded mb-4 opacity-70"
                                    />
                                )}
                                <div className="flex items-center justify-end mb-2">
                                    <span className="text-xs text-[#737373]">{product.stock} in stock</span>
                                </div>
                                <h2 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-sm font-medium text-[#a3a3a3] mb-1">
                                    {product.name}
                                </h2>
                                <p className="text-xs text-[#737373] mb-4 line-clamp-2 flex-1">{product.description}</p>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-[#a3a3a3] font-medium">${product.price}</span>
                                </div>
                                <button
                                    onClick={() => addToCart(product.id)}
                                    className={`add-btn w-full py-2 rounded text-xs tracking-wide ${addedId === product.id ? 'added' : ''}`}
                                >
                                    {addedId === product.id ? 'Added ✓' : 'Add to cart'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Products;
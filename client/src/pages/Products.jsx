import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addedId, setAddedId] = useState(null);
    const [search, setSearch] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sort, setSort] = useState('newest');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(delay);
    }, [search, minPrice, maxPrice, sort]);

    const fetchProducts = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (sort) params.append('sort', sort);

            const res = await api.get(`/api/products?${params.toString()}`);
            setProducts(res.data);
        } catch (err) {
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId) => {
        if (!token) { window.location.href = '/login'; return; }
        try {
            await api.post('/api/cart', { product_id: productId, quantity: 1 }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddedId(productId);
            setTimeout(() => setAddedId(null), 1500);
        } catch (err) {
            alert('Failed to add to cart');
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
                .product-card { background: #161616; border: 1px solid #252525; transition: border-color 0.2s, background 0.2s; }
                .product-card:hover { border-color: #3a3a3a; background: #1a1a1a; }
                .add-btn { background: transparent; border: 1px solid #2a2a2a; color: #737373; transition: all 0.2s; }
                .add-btn:hover { border-color: #a3a3a3; color: #f5f5f5; }
                .add-btn.added { border-color: #a3a3a3; color: #a3a3a3; }
                .filter-input { background: #161616; border: 1px solid #252525; color: #a3a3a3; font-family: 'DM Mono', monospace; font-size: 12px; padding: 6px 10px; border-radius: 6px; outline: none; transition: border-color 0.2s; }
                .filter-input::placeholder { color: #3a3a3a; }
                .filter-input:focus { border-color: #3a3a3a; }
                .filter-select { background: #161616; border: 1px solid #252525; color: #a3a3a3; font-family: 'DM Mono', monospace; font-size: 12px; padding: 6px 10px; border-radius: 6px; outline: none; cursor: pointer; transition: border-color 0.2s; }
                .filter-select:focus { border-color: #3a3a3a; }
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] { -moz-appearance: textfield; }
            `}</style>

            <Navbar />

            <div className="max-w-6xl mx-auto mt-10">
                <div className="flex items-center justify-between mb-6">
                    <h1 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-xl font-light text-[#f5f5f5]">
                        All Products
                    </h1>
                    <p className="text-xs text-[#737373]">{products.length} products</p>
                </div>

                {/* Filters */}
                <div className="mb-8 space-y-3">
                    {/* Search */}
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a3a3a] text-xs">⌕</span>
                        <input
                            type="text"
                            className="filter-input w-full pl-8"
                            placeholder="Search products..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Price & Sort */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                className="filter-input w-24"
                                placeholder="Min"
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                            />
                            <span className="text-xs text-[#3a3a3a]">—</span>
                            <input
                                type="number"
                                className="filter-input w-24"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                            />
                        </div>

                        <select
                            className="filter-select ml-auto"
                            value={sort}
                            onChange={e => setSort(e.target.value)}
                        >
                            <option value="newest">Newest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <p className="text-[#737373] text-sm">No products found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {products.map(product => (
                            <div key={product.id} className="product-card rounded-lg p-5 flex flex-col">
                                {product.image_url && (
                                    <img src={product.image_url} alt={product.name}
                                        className="w-full h-36 object-cover rounded mb-4 opacity-70" />
                                )}
                                <div className="flex items-center justify-end mb-2">
                                    <span className="text-xs text-[#737373]">{product.stock} in stock</span>
                                </div>
                                <h2 style={{ fontFamily: "'DM Sans', sans-serif" }}
                                    className="text-sm font-medium text-[#a3a3a3] mb-1">{product.name}</h2>
                                <p className="text-xs text-[#737373] mb-4 line-clamp-2 flex-1">{product.description}</p>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-[#a3a3a3] font-medium">${product.price}</span>
                                </div>
                                <button onClick={() => addToCart(product.id)}
                                    className={`add-btn w-full py-2 rounded text-xs tracking-wide ${addedId === product.id ? 'added' : ''}`}>
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
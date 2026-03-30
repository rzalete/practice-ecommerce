import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Search, ShoppingCart, Check, ChevronLeft, ChevronRight } from 'lucide-react';

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addedId, setAddedId] = useState(null);
    const [cartError, setCartError] = useState({ id: null, message: '' });
    const [search, setSearch] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
    const cartErrorTimeout = useRef(null);
    const token = localStorage.getItem('token');

    // Reset page ke 1 saat filter berubah
    useEffect(() => {
        setPage(1);
    }, [search, minPrice, maxPrice, sort]);

    // Fetch products saat page atau filter berubah
    useEffect(() => {
        const delay = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(delay);
    }, [search, minPrice, maxPrice, sort, page]);

    const fetchProducts = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (sort) params.append('sort', sort);
            params.append('page', page);
            params.append('limit', 12);

            const res = await api.get(`/api/products?${params.toString()}`);
            setProducts(res.data.products);
            setPagination(res.data.pagination);
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
            setCartError({ id: null, message: '' });
            setTimeout(() => setAddedId(null), 1500);
        } catch (err) {
            setCartError({ id: productId, message: err.response?.data?.message || 'Failed to add to cart' });
            if (cartErrorTimeout.current) clearTimeout(cartErrorTimeout.current);
            cartErrorTimeout.current = setTimeout(() => setCartError({ id: null, message: '' }), 3000);
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
                .filter-input { background: #161616; border: 1px solid #252525; color: #a3a3a3; font-family: 'DM Mono', monospace; font-size: 12px; padding: 6px 10px 6px 28px; border-radius: 6px; outline: none; transition: border-color 0.2s; }
                .filter-input::placeholder { color: #3a3a3a; }
                .filter-input:focus { border-color: #3a3a3a; }
                .filter-select { background: #161616; border: 1px solid #252525; color: #a3a3a3; font-family: 'DM Mono', monospace; font-size: 12px; padding: 6px 10px; border-radius: 6px; outline: none; cursor: pointer; transition: border-color 0.2s; }
                .filter-select:focus { border-color: #3a3a3a; }
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
                input[type=number] { -moz-appearance: textfield; }
            `}</style>

            <Navbar />

            <div className="max-w-6xl mx-auto mt-10">
                <div className="flex items-center justify-between mb-6">
                    <h1 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-xl font-light text-[#f5f5f5]">
                        All Products
                    </h1>
                    <p className="text-xs text-[#737373]">{pagination.total} products</p>
                </div>

                {/* Filters */}
                <div className="mb-8 space-y-3">
                    <div className="relative">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a3a3a] pointer-events-none" />
                        <input type="text" className="filter-input w-full" placeholder="Search products..."
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <input type="number" className="filter-input w-24" placeholder="Min"
                                value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                            <span className="text-xs text-[#3a3a3a]">—</span>
                            <input type="number" className="filter-input w-24" placeholder="Max"
                                value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                        </div>
                        <select className="filter-select ml-auto" value={sort} onChange={e => setSort(e.target.value)}>
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
                                    disabled={product.stock === 0}
                                    className={`add-btn w-full py-2 rounded text-xs tracking-wide flex items-center justify-center gap-1.5 ${addedId === product.id ? 'added' : ''
                                        } ${product.stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                    {product.stock === 0 ? 'Out of stock' : addedId === product.id
                                        ? <><Check size={12} /> Added</>
                                        : <><ShoppingCart size={12} /> Add to cart</>
                                    }
                                </button>
                                {cartError.id === product.id && (
                                    <p className="text-xs text-red-400 mt-2 text-center">{cartError.message}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                            className="text-[#737373] border border-[#252525] p-1.5 rounded hover:text-[#f5f5f5] hover:border-[#3a3a3a] transition-colors disabled:opacity-40">
                            <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)}
                                className={`text-xs px-3 py-1.5 rounded border transition-colors ${p === page
                                    ? 'text-[#f5f5f5] border-[#3a3a3a] bg-[#1f1f1f]'
                                    : 'text-[#737373] border-[#252525] hover:text-[#f5f5f5] hover:border-[#3a3a3a]'
                                    }`}>
                                {p}
                            </button>
                        ))}
                        <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages}
                            className="text-[#737373] border border-[#252525] p-1.5 rounded hover:text-[#f5f5f5] hover:border-[#3a3a3a] transition-colors disabled:opacity-40">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Products;
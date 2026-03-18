import { useState, useEffect } from 'react';
import axios from 'axios';

const emptyForm = { name: '', description: '', price: '', stock: '', image_url: '' };

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formError, setFormError] = useState('');

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
        if (!token || getRole() !== 'admin') {
            window.location.href = '/';
            return;
        }
        fetchProducts();
    }, []);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        try {
            if (editingId) {
                await axios.put(`/api/products/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/products', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setFormData(emptyForm);
            setEditingId(null);
            setShowForm(false);
            fetchProducts();
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                setFormError(data.errors.map(e => e.msg).join(', '));
            } else {
                setFormError(data?.message || 'Failed to save product');
            }
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock: product.stock,
            image_url: product.image_url || ''
        });
        setEditingId(product.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await axios.delete(`/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProducts();
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    const handleCancel = () => {
        setFormData(emptyForm);
        setEditingId(null);
        setShowForm(false);
        setFormError('');
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
        .product-row {
          background: #161616;
          border: 1px solid #252525;
        }
        .input-field {
          background: #111;
          border: 1px solid #222;
          color: #e5e5e5;
          transition: border-color 0.2s;
        }
        .input-field::placeholder { color: #444; }
        .input-field:focus { border-color: #555; outline: none; }
        .btn-primary {
          background: #f5f5f5;
          color: #0f0f0f;
          transition: background 0.2s;
        }
        .btn-primary:hover { background: #fff; }
        .btn-ghost {
          background: transparent;
          border: 1px solid #252525;
          color: #737373;
          transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: #a3a3a3; color: #f5f5f5; }
        .btn-danger { color: #3a3a3a; transition: color 0.2s; }
        .btn-danger:hover { color: #ef4444; }
      `}</style>

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-10 flex items-end justify-between border-b border-[#1f1f1f] pb-6">
                    <div>
                        <span className="text-xs text-[#737373] tracking-[0.3em] uppercase">store.io</span>
                        <h1 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-xl font-light text-[#f5f5f5] mt-2">
                            Manage Products
                        </h1>
                    </div>
                    <div className="flex gap-4 items-center">
                        <a href="/" className="text-xs text-[#737373] hover:text-[#a3a3a3] transition-colors">
                            Storefront
                        </a>
                        <button
                            onClick={() => setShowForm(true)}
                            className="btn-primary px-4 py-2 rounded text-xs font-medium tracking-wide"
                        >
                            + Add product
                        </button>
                    </div>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center px-4 z-50">
                        <div className="bg-[#161616] border border-[#252525] rounded-lg p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-6">
                                <h2 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-sm font-medium text-[#f5f5f5]">
                                    {editingId ? 'Edit product' : 'Add product'}
                                </h2>
                                <button className="btn-danger text-xs" onClick={handleCancel}>back</button>
                            </div>

                            {formError && (
                                <div className="mb-4 px-3 py-2 border border-red-900 bg-red-950 rounded text-red-400 text-xs">
                                    {formError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {[
                                    { label: 'Name', name: 'name', type: 'text', placeholder: 'Product name' },
                                    { label: 'Price', name: 'price', type: 'number', placeholder: '0.00' },
                                    { label: 'Stock', name: 'stock', type: 'number', placeholder: '0' },
                                    { label: 'Image URL', name: 'image_url', type: 'text', placeholder: 'https://...' },
                                ].map(field => (
                                    <div key={field.name}>
                                        <label className="block text-[#555] text-xs tracking-widest uppercase mb-2">{field.label}</label>
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            className="input-field w-full rounded px-4 py-2 text-sm"
                                            placeholder={field.placeholder}
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-[#555] text-xs tracking-widest uppercase mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="input-field w-full rounded px-4 py-2 text-sm resize-none"
                                        rows={3}
                                        placeholder="Product description"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="submit" className="btn-primary flex-1 py-2 rounded text-xs font-medium">
                                        {editingId ? 'Save changes' : 'Add product'}
                                    </button>
                                    <button type="button" onClick={handleCancel} className="btn-ghost px-4 py-2 rounded text-xs">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Products Table */}
                {products.length === 0 ? (
                    <p className="text-[#737373] text-sm">No products yet.</p>
                ) : (
                    <div className="space-y-2">
                        {products.map(product => (
                            <div key={product.id} className="product-row rounded-lg px-5 py-4 flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <h2 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-sm text-[#f5f5f5] font-medium">
                                        {product.name}
                                    </h2>
                                    <p className="text-xs text-[#737373] mt-1">{product.stock} in stock · ${product.price}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="text-xs text-[#737373] hover:text-[#f5f5f5] transition-colors"
                                    >
                                        edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="btn-danger text-xs"
                                    >
                                        delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminProducts;
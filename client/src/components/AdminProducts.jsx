import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const emptyForm = { name: '', description: '', price: '', stock: '', image_url: '' };

function AdminProducts({ token }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formError, setFormError] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/api/products');
            setProducts(res.data);
        } catch {
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImagePreview(URL.createObjectURL(file));
        setFormError('');
        setUploading(true);

        try {
            const data = new FormData();
            data.append('image', file);
            const res = await api.post('/api/upload', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setFormData(prev => ({ ...prev, image_url: res.data.url }));
        } catch (err) {
            setFormError(err.response?.data?.message || 'Image upload failed');
            setImagePreview('');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!formData.image_url) {
            setFormError('Please upload an image');
            return;
        }

        try {
            const payload = { ...formData };

            if (editingId) {
                await api.put(`/api/products/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await api.post('/api/products', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            handleCancel();
            fetchProducts();
        } catch (err) {
            const data = err.response?.data;
            setFormError(data?.errors?.map(e => e.msg).join(', ') || data?.message || 'Failed to save product');
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
        setImagePreview(product.image_url || '');
        setImageFile(null);
        setEditingId(product.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await api.delete(`/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProducts();
        } catch {
            alert('Failed to delete product');
        }
    };

    const handleCancel = () => {
        setFormData(emptyForm);
        setEditingId(null);
        setShowForm(false);
        setFormError('');
        setImageFile(null);
        setImagePreview('');
    };

    if (loading) return <p className="text-[#737373] text-sm py-10 text-center">Loading...</p>;
    if (error) return <p className="text-red-400 text-sm py-10 text-center">{error}</p>;

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <p className="text-xs text-[#737373]">{products.length} products</p>
                <button onClick={() => setShowForm(true)}
                    className="btn-primary px-4 py-2 rounded text-xs font-medium tracking-wide">
                    + Add product
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center px-4 z-50">
                    <div className="bg-[#161616] border border-[#252525] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-sm font-medium text-[#f5f5f5]">
                                {editingId ? 'Edit product' : 'Add product'}
                            </h2>
                            <button className="text-xs text-[#3a3a3a] hover:text-[#f5f5f5] transition-colors"
                                onClick={handleCancel}>back</button>
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
                            ].map(field => (
                                <div key={field.name}>
                                    <label className="block text-[#555] text-xs tracking-widest uppercase mb-2">{field.label}</label>
                                    <input type={field.type} name={field.name} value={formData[field.name]}
                                        onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })}
                                        className="input-field w-full rounded px-4 py-2 text-sm"
                                        placeholder={field.placeholder} />
                                </div>
                            ))}

                            <div>
                                <label className="block text-[#555] text-xs tracking-widest uppercase mb-2">Image</label>
                                {imagePreview && (
                                    <img src={imagePreview} alt="Preview"
                                        className="w-full h-36 object-cover rounded mb-2 opacity-70" />
                                )}
                                <input type="file" accept="image/jpeg,image/png,image/webp"
                                    ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                                <button type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="btn-ghost w-full py-2 rounded text-xs">
                                    {imagePreview ? 'Change image' : 'Upload image'}
                                </button>
                            </div>

                            <div>
                                <label className="block text-[#555] text-xs tracking-widest uppercase mb-2">Description</label>
                                <textarea name="description" value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field w-full rounded px-4 py-2 text-sm resize-none"
                                    rows={3} placeholder="Product description" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={uploading}
                                    className="btn-primary flex-1 py-2 rounded text-xs font-medium disabled:opacity-50">
                                    {uploading ? 'Uploading...' : editingId ? 'Save changes' : 'Add product'}
                                </button>
                                <button type="button" onClick={handleCancel}
                                    className="btn-ghost px-4 py-2 rounded text-xs">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {products.length === 0 ? (
                <p className="text-[#737373] text-sm">No products yet.</p>
            ) : (
                <div className="space-y-2">
                    {products.map(product => (
                        <div key={product.id} className="product-row rounded-lg px-5 py-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <div>
                                    <h2 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-sm text-[#f5f5f5] font-medium">
                                        {product.name}
                                    </h2>
                                    <p className="text-xs text-[#737373] mt-1">{product.stock} in stock · ${product.price}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => handleEdit(product)}
                                    className="text-xs text-[#737373] hover:text-[#f5f5f5] transition-colors">edit</button>
                                <button onClick={() => handleDelete(product.id)}
                                    className="text-xs text-[#3a3a3a] hover:text-red-400 transition-colors">delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

export default AdminProducts;
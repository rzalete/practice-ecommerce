import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AdminProducts from '../components/AdminProducts';
import AdminOrders from '../components/AdminOrders';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('products');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) { window.location.href = '/login'; return; }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role !== 'admin') window.location.href = '/';
        } catch {
            window.location.href = '/';
        }
    }, [token]);

    return (
        <div style={{ fontFamily: "'DM Mono', monospace" }} className="min-h-screen bg-[#0f0f0f] px-6 py-10">
            <style>{`
                .product-row { background: #161616; border: 1px solid #252525; transition: border-color 0.2s; }
                .product-row:hover { border-color: #3a3a3a; }
                .input-field { background: #111; border: 1px solid #222; color: #e5e5e5; transition: border-color 0.2s; }
                .input-field::placeholder { color: #444; }
                .input-field:focus { border-color: #555; outline: none; }
                .btn-primary { background: #f5f5f5; color: #0f0f0f; transition: background 0.2s; }
                .btn-primary:hover { background: #fff; }
                .btn-ghost { background: transparent; border: 1px solid #252525; color: #737373; transition: all 0.2s; }
                .btn-ghost:hover { border-color: #a3a3a3; color: #f5f5f5; }
                .status-select { background: #0f0f0f; border: 1px solid #252525; color: #a3a3a3; font-family: 'DM Mono', monospace; font-size: 12px; padding: 4px 8px; border-radius: 4px; outline: none; cursor: pointer; transition: border-color 0.2s; }
                .status-select:hover { border-color: #3a3a3a; }
                .status-select:disabled { opacity: 0.4; cursor: not-allowed; }
            `}</style>
            <Navbar />

            <div className="max-w-4xl mx-auto mt-10">
                <div className="flex items-center justify-between mb-10">
                    <h1 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-xl font-light text-[#f5f5f5]">
                        Admin Dashboard
                    </h1>
                    <div className="flex gap-1">
                        {['products', 'orders'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`text-xs px-3 py-1.5 rounded transition-colors capitalize ${activeTab === tab
                                        ? 'text-[#f5f5f5] bg-[#1f1f1f] border border-[#252525]'
                                        : 'text-[#737373] hover:text-[#a3a3a3]'
                                    }`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'products'
                    ? <AdminProducts token={token} />
                    : <AdminOrders token={token} />
                }
            </div>
        </div>
    );
}

export default AdminDashboard;
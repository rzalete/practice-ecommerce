import { useState } from 'react';
import api from '../services/api';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "'DM Mono', monospace" }} className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
            <style>{`
        .input-field {
          background: #111;
          border: 1px solid #222;
          color: #e5e5e5;
          transition: border-color 0.2s;
        }
        .input-field::placeholder { color: #444; }
        .input-field:focus { border-color: #555; outline: none; }
        .sign-in-btn {
          background: #e5e5e5;
          color: #0a0a0a;
          transition: background 0.2s;
        }
        .sign-in-btn:hover { background: #fff; }
        .sign-in-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0px 1000px #111 inset;
        -webkit-text-fill-color: #e5e5e5;
        transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

            <div className="w-full max-w-sm">
                {/* Brand / Logo */}
                <div className="mb-10">
                    <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-xs text-[#444] tracking-[0.3em] uppercase">
                        store.io
                    </span>
                </div>

                {/* Heading */}
                <h1 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-2xl font-light text-[#e5e5e5] mb-1">
                    Sign in
                </h1>
                <p className="text-xs text-[#444] mb-8 tracking-wide">
                    Enter your credentials to continue
                </p>

                {error && (
                    <div className="mb-6 px-3 py-2 border border-red-900 bg-red-950 rounded text-red-400 text-xs">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[#555] text-xs tracking-widest uppercase mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input-field w-full rounded px-4 py-3 text-sm"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-[#555] text-xs tracking-widest uppercase mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input-field w-full rounded px-4 py-3 text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="sign-in-btn w-full py-3 rounded text-sm font-medium tracking-wide"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <p className="mt-8 text-xs text-[#444]">
                    No account?{' '}
                    <a href="/register" className="text-[#888] hover:text-[#e5e5e5] transition-colors">
                        Register
                    </a>
                </p>
            </div>
        </div>
    );
}

export default Login;
import { useState } from 'react';
import api from '../services/api';

function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            await api.post('/api/auth/register', formData);
            setSuccess(true);
            setFormData({ name: '', email: '', password: '' });
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                const fieldErrors = {};
                data.errors.forEach(e => {
                    fieldErrors[e.path] = e.msg;
                });
                setErrors(fieldErrors);
            } else {
                setErrors({ general: data?.message || 'Registration failed' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "'DM Mono', monospace" }} className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');
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
                <div className="mb-10">
                    <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-xs text-[#444] tracking-[0.3em] uppercase">
                        store.io
                    </span>
                </div>

                <h1 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-2xl font-light text-[#e5e5e5] mb-1">
                    Create account
                </h1>
                <p className="text-xs text-[#444] mb-8 tracking-wide">
                    Fill in the details to get started
                </p>

                {errors.general && (
                    <div className="mb-6 px-3 py-2 border border-red-900 bg-red-950 rounded text-red-400 text-xs">
                        {errors.general}
                    </div>
                )}

                {success && (
                    <div className="mb-6 px-3 py-2 border border-green-900 bg-green-950 rounded text-green-400 text-xs">
                        Account created successfully.{' '}
                        <a href="/login" className="underline hover:text-green-300 transition-colors">
                            Sign in
                        </a>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[#555] text-xs tracking-widest uppercase mb-2">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input-field w-full rounded px-4 py-3 text-sm"
                            placeholder="Your name"
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>
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
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-[#555] text-xs tracking-widest uppercase mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field w-full rounded px-4 py-3 text-sm pr-10"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors text-xs"
                            >
                                {showPassword ? 'hide' : 'show'}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="sign-in-btn w-full py-3 rounded text-sm font-medium tracking-wide"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-xs text-[#444]">
                    Already have an account?{' '}
                    <a href="/login" className="text-[#888] hover:text-[#e5e5e5] transition-colors">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}

export default Register;
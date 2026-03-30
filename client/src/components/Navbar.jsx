import { useEffect, useState } from 'react';
import { ShoppingCart, Package, Settings, LogOut } from 'lucide-react';

function Navbar() {
    const [role, setRole] = useState(null);
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;

    useEffect(() => {
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setRole(payload.role);
            } catch {
                setRole(null);
            }
        }
    }, [token]);

    const handleSignOut = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    const navLink = (href, icon, label) => {
        const isActive = currentPath === href;
        return (
            <a href={href} className={`flex items-center gap-1.5 text-xs tracking-wide transition-colors ${isActive ? 'text-[#f5f5f5]' : 'text-[#737373] hover:text-[#a3a3a3]'}`}>
                {icon}
                {label}
            </a>
        );
    };

    return (
        <div className="border-b border-[#1f1f1f] px-6 py-5 flex items-center justify-between">
            <a href="/">
                <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-xs text-[#737373] tracking-[0.3em] uppercase hover:text-[#a3a3a3] transition-colors">
                    store.io
                </span>
            </a>
            <div className="flex gap-6 items-center">
                {token ? (
                    <>
                        {role === 'admin' && navLink('/admin', <Settings size={13} />, 'Admin')}
                        {navLink('/cart', <ShoppingCart size={13} />, 'Cart')}
                        {navLink('/orders', <Package size={13} />, 'Orders')}
                        <button onClick={handleSignOut}
                            className="flex items-center gap-1.5 text-xs text-[#737373] hover:text-[#a3a3a3] transition-colors tracking-wide">
                            <LogOut size={13} />
                            Sign out
                        </button>
                    </>
                ) : (
                    navLink('/login', null, 'Sign in')
                )}
            </div>
        </div>
    );
}

export default Navbar;
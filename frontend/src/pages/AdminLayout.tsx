import type React from 'react';
import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    const navItems = [
        { path: '/admin/foglalasok', label: '📅 Foglalások', name: 'Foglalások' },
        { path: '/admin/italok', label: '🍺 Itallap', name: 'Itallap' },
        { path: '/admin/esemenyek', label: '🎉 Események', name: 'Események' },
        { path: '/admin/asztalok', label: '🪑 Asztalok', name: 'Asztalok' },
        { path: '/admin/nyitvatartas', label: '🕒 Nyitvatartás', name: 'Nyitvatartás' }
    ];

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col md:flex-row">
            <div className="md:hidden bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center sticky top-0 z-40">
                <h1 className="font-bold text-green-500 tracking-wider">MURI ADMIN</h1>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-neutral-800 rounded text-neutral-300 focus:outline-none"
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>
            </div>
            <aside
                className={`fixed md:sticky md:top-0 h-dvh w-64 bg-neutral-950 border-r border-neutral-800 p-6 pb-10 flex flex-col justify-between shrink-0 z-50 transform transition-transform duration-200 ease-in-out ${isMobileMenuOpen ? 'translate-x-0 inset-y-0 left-0' : '-translate-x-full md:translate-x-0'}`}
            >
                <div>
                    <div className="hidden md:block mb-8">
                        <h1 className="text-xl font-bold text-green-500 tracking-wider">MURI PUB & MORE</h1>
                        <p className="text-xs text-neutral-500 mt-0.5">Adminisztrációs Felület</p>
                    </div>
                    <nav className="space-y-2 mt-4 md:mt-0">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${isActive
                                        ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="pt-6 pb-6 md:pb-0 border-t border-neutral-800">
                    <button
                        onClick={handleLogout}
                        className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-red-600/20 hover:text-red-400 border border-neutral-800 hover:border-red-500/30 rounded-lg text-neutral-400 font-semibold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                    >
                        🚪 Kijelentkezés
                    </button>
                </div>
            </aside>
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                />
            )}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};
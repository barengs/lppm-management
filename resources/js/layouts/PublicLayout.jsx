import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import useAuth from '../store/useAuthStore';
import useSystemStore from '../store/useSystemStore';
import api from '../utils/api';

export default function PublicLayout() {
    const { isAuthenticated, user, fetchUser } = useAuth();
    const { settings } = useSystemStore(); 
    const [dropdown, setDropdown] = React.useState(null);
    const [primaryMenu, setPrimaryMenu] = React.useState([]);
    const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    React.useEffect(() => {
        fetchUser();
        api.get('/public/menus/primary')
            .then(res => setPrimaryMenu(res.data.items))
            .catch(err => console.error(err));
    }, []);

    const handleMouseEnter = (id) => setDropdown(id);
    const handleMouseLeave = () => setDropdown(null);

    const renderMenuItem = (item) => {
        const hasChildren = item.children && item.children.length > 0;
        
        if (hasChildren) {
            return (
                <div key={item.id} className="relative group" onMouseEnter={() => handleMouseEnter(item.id)} onMouseLeave={handleMouseLeave}>
                    <button className="flex items-center hover:text-yellow-300 py-4 focus:outline-none uppercase">
                        {item.title}
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {dropdown === item.id && (
                        <div className="absolute left-0 mt-0 w-56 bg-white text-gray-800 shadow-xl rounded-b-md border-t-2 border-yellow-400 animate-fade-in-down">
                            {item.children.map(child => (
                                <Link key={child.id} to={child.url} className="block px-4 py-3 hover:bg-gray-100 hover:text-green-600 transition">
                                    {child.title}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link key={item.id} to={item.url} className="hover:text-yellow-300 py-4 uppercase">
                {item.title}
            </Link>
        );
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
            {/* Top Bar */}
            <div className="bg-white py-4 border-b border-gray-200 relative overflow-hidden">
                {/* Batik Pattern Background */}
                 <div 
                    className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply top-0 left-0 w-full h-full"
                    style={{
                        backgroundImage: "url('/images/batik-pattern.png')",
                        backgroundSize: '400px',
                        backgroundRepeat: 'repeat',
                        backgroundPosition: 'center'
                    }}
                ></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center relative z-10">
                    <div className="flex items-center space-x-4">
                        <img 
                            src={settings.logo_path ? `/storage/${settings.logo_path}` : "https://i0.wp.com/www.uim.ac.id/uimv2/wp-content/uploads/2020/10/Ico.png"} 
                            alt="Logo" 
                            className="h-12 w-12 md:h-16 md:w-16 object-contain" 
                        />
                         <div>
                            <h1 className="text-lg md:text-xl font-bold tracking-tight" style={{ color: 'var(--primary-color)' }}>{settings.system_name}</h1>
                            <p className="text-[10px] md:text-xs text-gray-500 font-medium tracking-wide">{settings.description}</p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 hidden md:block">
                       Universitas Islam Madura
                    </div>
                </div>
            </div>
            {/* Navigation Bar */}
            {/* Navigation Bar */}
            {/* Navigation Bar */}
            <nav className="text-white sticky top-0 z-50 shadow-md transition-colors duration-300" style={{ backgroundColor: 'var(--primary-color)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-12">
                        
                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
                            {primaryMenu.length > 0 ? primaryMenu.map(item => renderMenuItem(item)) : (
                                <div className="text-green-300 text-xs">Loading menu...</div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center md:hidden">
                            <button 
                                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-white hover:text-yellow-300 focus:outline-none"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>

                        {/* Right Side (Auth) */}
                         <div className="hidden md:flex items-center space-x-4">
                            {isAuthenticated ? (
                                <>
                                    <span className="text-green-100 text-xs">Halo, {user?.name || 'User'}</span>
                                    <Link to="/dashboard" className="bg-yellow-500 text-green-900 px-5 py-1.5 rounded font-bold hover:bg-yellow-400 transition-colors shadow flex items-center">
                                        DASHBOARD
                                    </Link>
                                </>
                            ) : (
                                <Link to="/login" className="bg-yellow-500 text-green-900 px-5 py-1.5 rounded font-bold hover:bg-yellow-400 transition-colors shadow">
                                    LOGIN
                                </Link>
                            )}
                        </div>
                         {/* Mobile Logo (Centered if needed, or just keep spacing) */}
                         <div className="md:hidden flex-grow text-center font-bold text-yellow-300">
                            LPPM UIM
                         </div>
                         
                         {/* Mobile Auth Icon (Optional, or put in menu) */}
                         <div className="md:hidden">
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="text-white hover:text-yellow-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </Link>
                            ) : (
                                <Link to="/login" className="text-white hover:text-yellow-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                </Link>
                            )}
                         </div>

                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-green-800 text-white animate-fade-in-down border-t border-green-600">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {primaryMenu.map(item => (
                                <div key={item.id}>
                                    {item.children && item.children.length > 0 ? (
                                        <>
                                            <div className="px-3 py-2 text-yellow-300 font-bold uppercase">{item.title}</div>
                                            {item.children.map(child => (
                                                 <Link 
                                                    key={child.id} 
                                                    to={child.url} 
                                                    className="block px-3 py-2 pl-6 rounded-md text-base font-medium hover:bg-green-700 hover:text-white"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    - {child.title}
                                                </Link>
                                            ))}
                                        </>
                                    ) : (
                                        <Link 
                                            to={item.url} 
                                            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700 hover:text-white uppercase"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.title}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-grow bg-gray-50">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="text-white py-12 border-t-4 border-yellow-500" style={{ backgroundColor: 'var(--primary-color)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center mb-4 space-x-3">
                             <img 
                                src={settings.logo_path ? `/storage/${settings.logo_path}` : "https://i0.wp.com/www.uim.ac.id/uimv2/wp-content/uploads/2020/10/Ico.png"} 
                                alt="Logo" 
                                className="h-12 w-12 object-contain brightness-0 invert" 
                             />
                             <span className="text-xl font-bold">{settings.system_name}</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed max-w-md">
                            {settings.description}
                        </p>
                         <div className="mt-6 flex space-x-4">
                            {/* Social Icons Placeholder */}
                             <a href="#" className="text-gray-400 hover:text-white"><span className="sr-only">Facebook</span>FB</a>
                             <a href="#" className="text-gray-400 hover:text-white"><span className="sr-only">Twitter</span>TW</a>
                             <a href="#" className="text-gray-400 hover:text-white"><span className="sr-only">Instagram</span>IG</a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-yellow-400">TAUTAN PENTING</h3>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li><a href="https://uim.ac.id" className="hover:text-white hover:underline decoration-yellow-400 decoration-2 underline-offset-4">Universitas Islam Madura</a></li>
                            <li><a href="https://sinta.kemdiktisaintek.go.id/" className="hover:text-white hover:underline decoration-yellow-400 decoration-2 underline-offset-4">SINTA Kemdikbud</a></li>
                            <li><a href="https://garuda.kemdiktisaintek.go.id/" className="hover:text-white hover:underline decoration-yellow-400 decoration-2 underline-offset-4">GARUDA</a></li>
                            <li><a href="https://scholar.google.com" className="hover:text-white hover:underline decoration-yellow-400 decoration-2 underline-offset-4">Google Scholar</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-yellow-400">KONTAK KAMI</h3>
                        <div className="text-sm text-gray-300 space-y-3">
                            <p className="flex items-start">
                                <svg className="w-5 h-5 mr-3 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span>{settings.address}</span>
                            </p>
                            <p className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {settings.email}
                            </p>
                            <p className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                {settings.phone}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Lembaga Penelitian dan Pengabdian Masyarakat Universitas Islam Madura. Developed by <a href="https://unggul.id" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:text-yellow-400">PT. Unggul Mediatama Indonesia</a>
                </div>
            </footer>
        </div>
    );
}

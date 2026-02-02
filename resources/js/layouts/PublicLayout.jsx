import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';

export default function PublicLayout() {
    const { isAuthenticated, user, fetchUser } = useAuthStore();
    const [dropdown, setDropdown] = React.useState(null);
    const [primaryMenu, setPrimaryMenu] = React.useState([]);

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
                        <img src="https://i0.wp.com/www.uim.ac.id/uimv2/wp-content/uploads/2020/10/Ico.png" alt="Logo" className="h-16 w-16 object-contain" />
                         <div>
                            <h1 className="text-xl font-bold text-blue-900 tracking-tight">LPPM UIM</h1>
                            <p className="text-xs text-gray-500 font-medium tracking-wide">Lembaga Penelitian dan Pengabdian kepada Masyarakat</p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 hidden md:block">
                       Universitas Islam Madura
                    </div>
                </div>
            </div>
            {/* Navigation Bar */}
            <nav className="bg-green-700 text-white sticky top-0 z-50 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-12 space-x-6 text-sm font-medium">
                        
                        {/* Dynamic Menu Rendering */}
                        {primaryMenu.length > 0 ? primaryMenu.map(item => renderMenuItem(item)) : (
                            /* Fallback Skeleton or default */
                            <div className="text-green-300 text-xs">Loading menu...</div>
                        )}

                        <div className="flex-grow"></div>
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-green-100 text-xs hidden md:inline-block">Halo, {user?.name || 'User'}</span>
                                <Link to="/dashboard" className="bg-yellow-500 text-green-900 px-5 py-1.5 rounded font-bold hover:bg-yellow-400 transition-colors shadow flex items-center">
                                    DASHBOARD
                                </Link>
                            </div>
                        ) : (
                            <Link to="/login" className="bg-yellow-500 text-green-900 px-5 py-1.5 rounded font-bold hover:bg-yellow-400 transition-colors shadow">
                                LOGIN
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow bg-gray-50">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-[#004d40] text-white py-12 border-t-4 border-yellow-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center mb-4 space-x-3">
                             <img src="https://i0.wp.com/www.uim.ac.id/uimv2/wp-content/uploads/2020/10/Ico.png" alt="Logo" className="h-12 w-12 object-contain brightness-0 invert" />
                             <span className="text-xl font-bold">LPPM UIM</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed max-w-md">
                            Lembaga Penelitian dan Pengabdian kepada Masyarakat Universitas Islam Madura berkomitmen untuk mengembangkan ilmu pengetahuan dan teknologi melalui riset dan pengabdian yang berkualitas.
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
                                <span>Kompleks Pondok Pesantren Miftahul Ulum, Bettet, Pamekasan, Jawa Timur.</span>
                            </p>
                            <p className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                lppm@uim.ac.id
                            </p>
                            <p className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                (0324) 321706
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

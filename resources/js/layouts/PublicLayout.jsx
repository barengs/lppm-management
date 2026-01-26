import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function PublicLayout() {
    const [dropdown, setDropdown] = React.useState(null);

    const handleMouseEnter = (name) => setDropdown(name);
    const handleMouseLeave = () => setDropdown(null);

    return (
        <div className="min-h-screen flex flex-col font-sans">
            {/* Top Bar */}
            <div className="bg-white py-2 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Logo_UIM.png/600px-Logo_UIM.png" alt="Logo" className="h-12" />
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
                        
                        {/* Beranda */}
                        <Link to="/" className="hover:text-yellow-300 py-4">BERANDA</Link>

                        {/* Program Kegiatan */}
                        <div className="relative group" onMouseEnter={() => handleMouseEnter('program')} onMouseLeave={handleMouseLeave}>
                            <button className="flex items-center hover:text-yellow-300 py-4 focus:outline-none">
                                PROGRAM KEGIATAN
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {dropdown === 'program' && (
                                <div className="absolute left-0 mt-0 w-56 bg-white text-gray-800 shadow-xl rounded-b-md border-t-2 border-yellow-400 animate-fade-in-down">
                                    <Link to="/research" className="block px-4 py-3 hover:bg-gray-100 hover:text-green-600 transition">Penelitian</Link>
                                    <Link to="/kkn" className="block px-4 py-3 hover:bg-gray-100 hover:text-green-600 transition">Kuliah Kerja Nyata</Link>
                                    <Link to="/abmas" className="block px-4 py-3 hover:bg-gray-100 hover:text-green-600 transition">Pengabdian Masyarakat</Link>
                                </div>
                            )}
                        </div>

                        {/* Kebijakan */}
                        <div className="relative group" onMouseEnter={() => handleMouseEnter('kebijakan')} onMouseLeave={handleMouseLeave}>
                            <button className="flex items-center hover:text-yellow-300 py-4 focus:outline-none">
                                KEBIJAKAN
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {dropdown === 'kebijakan' && (
                                <div className="absolute left-0 mt-0 w-64 bg-white text-gray-800 shadow-xl rounded-b-md border-t-2 border-yellow-400 animate-fade-in-down">
                                    <Link to="/policies/quality" className="block px-4 py-3 hover:bg-gray-100 hover:text-green-600 transition">Kebijakan Mutu</Link>
                                    <Link to="/policies/guidelines" className="block px-4 py-3 hover:bg-gray-100 hover:text-green-600 transition">Panduan Penelitian & Pengabdian</Link>
                                </div>
                            )}
                        </div>

                        {/* Prosedur */}
                        <Link to="/procedures" className="hover:text-yellow-300 py-4">PROSEDUR & ATURAN</Link>

                        {/* Tentang */}
                        <div className="relative group" onMouseEnter={() => handleMouseEnter('tentang')} onMouseLeave={handleMouseLeave}>
                            <button className="flex items-center hover:text-yellow-300 py-4 focus:outline-none">
                                TENTANG
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {dropdown === 'tentang' && (
                                <div className="absolute left-0 mt-0 w-56 bg-white text-gray-800 shadow-xl rounded-b-md border-t-2 border-yellow-400 animate-fade-in-down">
                                    <Link to="/about/vision-mission" className="block px-4 py-3 hover:bg-gray-100 hover:text-green-600 transition">Visi Misi</Link>
                                    <Link to="/about/organization" className="block px-4 py-3 hover:bg-gray-100 hover:text-green-600 transition">Struktur Organisasi</Link>
                                    <Link to="/contact" className="block px-4 py-3 hover:bg-gray-100 hover:text-green-600 transition">Hubungi Kami</Link>
                                </div>
                            )}
                        </div>

                        <div className="flex-grow"></div>
                        <Link to="/login" className="bg-yellow-500 text-green-900 px-5 py-1.5 rounded font-bold hover:bg-yellow-400 transition-colors shadow">
                            LOGIN
                        </Link>
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
                             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Logo_UIM.png/600px-Logo_UIM.png" alt="Logo" className="h-10 brightness-0 invert" />
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
                            <li><a href="#" className="hover:text-white hover:underline decoration-yellow-400 decoration-2 underline-offset-4">Universitas Islam Madura</a></li>
                            <li><a href="#" className="hover:text-white hover:underline decoration-yellow-400 decoration-2 underline-offset-4">SINTA Kemdikbud</a></li>
                            <li><a href="#" className="hover:text-white hover:underline decoration-yellow-400 decoration-2 underline-offset-4">GARUDA</a></li>
                            <li><a href="#" className="hover:text-white hover:underline decoration-yellow-400 decoration-2 underline-offset-4">Google Scholar</a></li>
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
                    &copy; {new Date().getFullYear()} Lembaga Penelitian dan Pengabdian Masyarakat Universitas Islam Madura. Developed by UIM Dev Team.
                </div>
            </footer>
        </div>
    );
}

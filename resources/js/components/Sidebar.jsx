import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { 
    Home, FileText, MapPin, ClipboardList, 
    Newspaper, FolderOpen, Image, 
    User, Award, Users, LogOut,
    LayoutDashboard, PlusCircle, BarChart2,
    Calendar, Settings, TrendingUp, Shield, Star,
    Building, School
} from 'lucide-react';

export default function Sidebar() {
    const { logout, user } = useAuthStore();
    const location = useLocation();

    const isActive = (path) => location.pathname.startsWith(path);

    const menuGroups = [
        {
            title: 'Main',
            items: [
                { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
            ]
        },
        {
            title: 'Penelitian & Pengabdian',
            items: [
                { name: 'Daftar Proposal', icon: <FileText size={18} />, path: '/proposals' },
                { name: 'Review Proposal', icon: <Star size={18} />, path: '/reviews' },
            ]
        },
        {
            title: 'KKN (Kuliah Kerja Nyata)',
            items: user?.role === 'mahasiswa' 
                ? [
                    { name: 'Status KKN Saya', icon: <ClipboardList size={18} />, path: '/kkn/status' },
                  ]
                : [
                    { name: 'Pendaftaran', icon: <Users size={18} />, path: '/kkn/registration' },
                    { name: 'Lokasi KKN', icon: <MapPin size={18} />, path: '/kkn/locations' },
                    { name: 'Peserta KKN', icon: <Users size={18} />, path: '/kkn/participants' },
                    { name: 'Laporan', icon: <BarChart2 size={18} />, path: '/reports' },
                  ]
        },
    ];

    if (user?.role === 'admin') {
        // Master Data (Excluding Users)
        menuGroups.push({
            title: 'Master Data',
            items: [
                { name: 'Fakultas', icon: <Building size={18} />, path: '/master/faculties' },
                { name: 'Program Studi', icon: <School size={18} />, path: '/master/study-programs' },
                { name: 'Tahun Anggaran', icon: <Calendar size={18} />, path: '/master/fiscal-years' },
                { name: 'Skema Hibah', icon: <Settings size={18} />, path: '/master/schemes' },
            ]
        });

        // User Management Group
        menuGroups.push({
            title: 'Manajemen Pengguna',
            items: [
                { name: 'Daftar Staff / Dosen', icon: <Users size={18} />, path: '/master/users' },
                // { name: 'Daftar Mahasiswa', icon: <Users size={18} />, path: '/master/students' }, // Merged with Peserta KKN

                { name: 'Struktur Organisasi', icon: <Users size={18} />, path: '/admin/organization' },
                { name: 'Hak Akses (Role)', icon: <Shield size={18} />, path: '/admin/roles' },
            ]
        });
    }

    if (user?.role === 'reviewer') {
        menuGroups.push({
            title: 'Reviewer Area',
            items: [
                { name: 'Review Usulan', icon: <Star size={18} />, path: '/reviews' },
            ]
        });
    }

    menuGroups.push(
        {
            title: 'CMS & Informasi',
            items: [
                { name: 'Berita & Artikel', icon: <Newspaper size={18} />, path: '/cms/posts' },
                { name: 'Dokumen', icon: <FileText size={18} />, path: '/cms/documents' },
                { name: 'Galeri', icon: <Image size={18} />, path: '/cms/galleries' },
                { name: 'Manajemen Menu', icon: <FolderOpen size={18} />, path: '/admin/menus' },
            ]
        },
        {
            title: 'Profil',
            items: [
                { name: 'Profil Saya', icon: <User size={18} />, path: '/profile' },
                { name: 'Kinerja Dosen', icon: <TrendingUp size={18} />, path: '/profile/stats' },
                { name: 'Organisasi', icon: <Users size={18} />, path: '/organization' },
            ]
        }
    );

    return (
        <div className="w-64 bg-[#004d40] text-white min-h-screen flex flex-col shadow-xl flex-shrink-0">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 bg-[#00251a] border-b border-green-800 space-x-3">
                 <img src="https://i0.wp.com/www.uim.ac.id/uimv2/wp-content/uploads/2020/10/Ico.png" alt="UIM Logo" className="h-10 w-10 object-contain" />
                <span className="text-xl font-bold tracking-wider">LPPM UIM</span>
            </div>

            {/* Menu */}
            <div className="flex-grow py-4 overflow-y-auto">
                {menuGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="mb-6">
                        <h3 className="px-6 text-xs font-semibold text-green-200 uppercase tracking-wider mb-2">
                            {group.title}
                        </h3>
                        <ul>
                            {group.items.map((item, itemIdx) => (
                                <li key={itemIdx}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center px-6 py-2 text-sm font-medium transition-colors ${
                                            isActive(item.path) 
                                                ? 'bg-green-700 text-white border-r-4 border-yellow-400' 
                                                : 'text-gray-300 hover:bg-green-800 hover:text-white'
                                        }`}
                                    >
                                        <span className="mr-3">{item.icon}</span>
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-green-800 bg-[#00251a]">
                <button
                    onClick={logout}
                    className="flex w-full items-center px-2 py-2 text-sm font-medium text-red-300 hover:bg-green-900 hover:text-red-200 rounded-md transition-colors"
                >
                    <LogOut size={18} className="mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
}

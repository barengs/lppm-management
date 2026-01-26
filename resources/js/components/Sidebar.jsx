import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { 
    Home, FileText, MapPin, ClipboardList, 
    Newspaper, FolderOpen, Image, 
    User, Award, Users, LogOut 
} from 'lucide-react';

export default function Sidebar() {
    const { logout } = useAuthStore();
    const location = useLocation();

    const isActive = (path) => location.pathname.startsWith(path);

    const menuGroups = [
        {
            title: 'DASHBOARD',
            items: [
                { name: 'Dashboard', path: '/dashboard', icon: <Home size={18} /> },
            ]
        },
        {
            title: 'PROGRAM KEGIATAN',
            items: [
                { name: 'Proposal', path: '/proposals', icon: <FileText size={18} /> },
                { name: 'KKN', path: '/kkn', icon: <MapPin size={18} /> },
                { name: 'Laporan', path: '/reports', icon: <ClipboardList size={18} /> },
            ]
        },
        {
            title: 'CMS & PUBLIKASI',
            items: [
                { name: 'Berita', path: '/cms/posts', icon: <Newspaper size={18} /> },
                { name: 'Dokumen', path: '/cms/documents', icon: <FolderOpen size={18} /> },
                { name: 'Galeri', path: '/cms/galleries', icon: <Image size={18} /> },
            ]
        },
        {
            title: 'PROFIL & DATA',
            items: [
                { name: 'Profil Saya', path: '/profile', icon: <User size={18} /> },
                { name: 'Kinerja (Scholar)', path: '/profile/stats', icon: <Award size={18} /> },
                { name: 'Struktur Organisasi', path: '/organization', icon: <Users size={18} /> },
            ]
        }
    ];

    return (
        <div className="w-64 bg-[#004d40] text-white min-h-screen flex flex-col shadow-xl flex-shrink-0">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 bg-[#00251a] border-b border-green-800">
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

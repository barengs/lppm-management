import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsCollapsed, toggleSidebar as toggleSidebarAction } from '../store/slices/sidebarSlice';
import { selectSettings } from '../store/slices/systemSlice';
import { 
    Home, FileText, MapPin, ClipboardList, 
    Newspaper, FolderOpen, Image, 
    User, Award, Users, LogOut,
    LayoutDashboard, PlusCircle, BarChart2,
    Calendar, Settings, TrendingUp, Shield, Star,
    Building, School, MessageSquare, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function Sidebar() {
    const { logout, user } = useAuth();
    const dispatch = useDispatch();
    const isCollapsed = useSelector(selectIsCollapsed);
    const toggleSidebar = () => dispatch(toggleSidebarAction());
    const settings = useSelector(selectSettings);
    const location = useLocation();

    const isActive = (path) => location.pathname.startsWith(path);

    // Helper to check permission
    const can = (permission) => {
        if (!permission) return true;
        if (user?.role === 'admin') return true;
        return user?.granted_permissions?.includes(permission);
    };

    // Menu Definition
    const rawMenuGroups = [
        {
            title: 'Main',
            items: [
                { 
                    name: 'Dashboard', 
                    icon: <LayoutDashboard size={20} />, 
                    path: user?.role === 'mahasiswa' ? '/dashboard/kkn' : '/dashboard' 
                },
            ]
        },
        {
            title: 'Penelitian & Pengabdian',
            items: [
                { name: 'Daftar Proposal', icon: <FileText size={20} />, path: '/proposals', permission: 'proposals.view' },
                { name: 'Review Proposal', icon: <Star size={20} />, path: '/reviews', permission: 'proposals.review' },
                { name: 'Cek Jurnal', icon: <Newspaper size={20} />, path: '/journals' },
            ]
        },
        {
            title: 'KKN (Kuliah Kerja Nyata)',
            items: [
                 // Student Only - Status KKN
                 ...(user?.role === 'mahasiswa' ? [
                    { name: 'Status KKN Saya', icon: <ClipboardList size={20} />, path: '/kkn/status', permission: 'kkn.register' },
                 ] : []),
                 { name: 'Periode KKN', icon: <Calendar size={20} />, path: '/kkn/periods', permission: 'kkn_periods.view' },
                 { name: 'Pendaftaran', icon: <Users size={20} />, path: '/kkn/registration', permission: 'kkn_registrations.view' },
                 { name: 'Lokasi KKN', icon: <MapPin size={20} />, path: '/kkn/locations', permission: 'kkn_locations.view' },
                 { name: 'Posko KKN', icon: <Home size={20} />, path: '/kkn/postos', permission: 'kkn_locations.view' },
                 { name: 'Peserta KKN', icon: <Users size={20} />, path: '/kkn/participants', permission: 'kkn_registrations.view' },
                 // Student/Dosen Only (Requires My Posto context)
                 ...(user?.role !== 'admin' ? [
                    { name: 'Bimbingan', icon: <MessageSquare size={20} />, path: '/dashboard/kkn/guidance', permission: 'kkn_guidance.view' },
                    { name: 'Laporan & Kegiatan', icon: <FileText size={20} />, path: '/dashboard/kkn/reports', permission: 'kkn_reports.view' },
                 ] : []),
                 // Admin/Dosen Monitoring
                 { name: 'Penilaian', icon: <Award size={20} />, path: '/kkn/assessment', permission: 'kkn_grades.view' },
                 { name: 'Laporan Monitoring', icon: <BarChart2 size={20} />, path: '/reports', permission: 'reports.view' },
            ]
        },
        {
            title: 'Master Data',
            permission: 'faculties.view', 
            items: [
                { name: 'Fakultas', icon: <Building size={20} />, path: '/master/faculties', permission: 'faculties.view' },
                { name: 'Program Studi', icon: <School size={20} />, path: '/master/study-programs', permission: 'study_programs.view' },
                { name: 'Tahun Anggaran', icon: <Calendar size={20} />, path: '/master/fiscal-years', permission: 'fiscal_years.view' },
                { name: 'Skema Hibah', icon: <Settings size={20} />, path: '/master/schemes', permission: 'schemes.view' },
                { name: 'Daftar Staff / Dosen', icon: <Users size={20} />, path: '/master/users', permission: 'users.view' },
            ]
        },
        {
            title: 'Manajemen Sistem',
            items: [
                { name: 'Struktur Organisasi', icon: <Users size={20} />, path: '/admin/organization', permission: 'organization.view' },
                { name: 'Hak Akses (Role)', icon: <Shield size={20} />, path: '/admin/roles', permission: 'roles.view' },
                { name: 'Permission', icon: <Shield size={20} />, path: '/admin/permissions', permission: 'permissions.view' },
                { name: 'Manajemen Menu', icon: <FolderOpen size={20} />, path: '/admin/menus', permission: 'menus.view' },
                { name: 'Halaman Statis', icon: <FileText size={20} />, path: '/admin/pages', permission: 'pages.view' },
                { name: 'Sistem Setting', icon: <Settings size={20} />, path: '/admin/settings', permission: 'settings.view' }, // Admin only by default logic or add permission
            ]
        },
        {
            title: 'CMS & Informasi',
            items: [
                { name: 'Berita & Artikel', icon: <Newspaper size={20} />, path: '/cms/posts', permission: 'posts.view' },
                { name: 'Dokumen', icon: <FileText size={20} />, path: '/cms/documents', permission: 'documents.view' },
                { name: 'Galeri', icon: <Image size={20} />, path: '/cms/galleries', permission: 'galleries.view' }
            ]
        },
        {
            title: 'Profil',
            items: [
                { name: 'Profil Saya', icon: <User size={20} />, path: '/profile' },
                // Only show Kinerja Dosen if user is a lecturer
                ...(user?.role === 'dosen' ? [
                    { name: 'Kinerja Dosen', icon: <TrendingUp size={20} />, path: '/profile/stats' }
                ] : []),
                { name: 'Organisasi', icon: <Users size={20} />, path: '/organization', permission: 'organization.view' },
            ]
        }
    ];

    // Filter Groups and Items
    const menuGroups = rawMenuGroups.map(group => {
        const filteredItems = group.items.filter(item => can(item.permission));
        if (filteredItems.length === 0) return null;
        return { ...group, items: filteredItems };
    }).filter(group => group !== null);


    return (
        <div className={`${isCollapsed ? 'w-20' : 'w-64'} text-white h-full flex flex-col shadow-xl transition-all duration-300`} style={{ backgroundColor: 'var(--primary-color)' }}>
            {/* Brand */}
            <div className={`h-16 flex-shrink-0 flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-6 space-x-3'} bg-black/20 border-b border-white/10 transition-all duration-300`}>
                 <img 
                    src={settings.logo_path ? `/storage/${settings.logo_path}` : "https://i0.wp.com/www.uim.ac.id/uimv2/wp-content/uploads/2020/10/Ico.png"} 
                    alt="Logo" 
                    className="h-10 w-10 object-contain" 
                 />
                {!isCollapsed && <span className="text-xl font-bold tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">{settings.system_name}</span>}
            </div>

            {/* Menu */}
            <div className="flex-grow py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-green-800 hover:scrollbar-thumb-green-700">
                {menuGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="mb-6">
                        {!isCollapsed && (
                            <h3 className="px-6 text-xs font-semibold text-green-200 uppercase tracking-wider mb-2 whitespace-nowrap overflow-hidden">
                                {group.title}
                            </h3>
                        )}
                        {/* Divider for collapsed mode to separate groups visually */}
                        {isCollapsed && groupIdx > 0 && <div className="mx-4 border-t border-green-800 my-2"></div>}
                        
                        <ul>
                            {group.items.map((item, itemIdx) => (
                                <li key={itemIdx} title={isCollapsed ? item.name : ''}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-6'} py-2.5 text-sm font-medium transition-colors ${
                                            isActive(item.path) 
                                                ? 'bg-green-700 text-white ' + (!isCollapsed ? 'border-r-4 border-yellow-400' : 'bg-opacity-100 rounded-lg mx-2')
                                                : 'text-gray-300 hover:bg-green-800 hover:text-white'
                                        }`}
                                    >
                                        <span className={`${!isCollapsed ? 'mr-3' : ''}`}>{item.icon}</span>
                                        {!isCollapsed && <span>{item.name}</span>}
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
                    className={`flex w-full items-center ${isCollapsed ? 'justify-center' : ''} px-2 py-2 text-sm font-medium text-red-300 hover:bg-green-900 hover:text-red-200 rounded-md transition-colors`}
                    title={isCollapsed ? 'Logout' : ''}
                >
                    <LogOut size={20} className={`${!isCollapsed ? 'mr-3' : ''}`} />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
}

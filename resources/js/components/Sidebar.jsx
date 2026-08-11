import React, { useState, useEffect } from 'react';
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
    Building, School, MessageSquare, ChevronLeft, ChevronRight,
    SlidersHorizontal
} from 'lucide-react';

import api from '../utils/api';
import * as LucideIcons from 'lucide-react';

export default function Sidebar() {
    const dispatch = useDispatch();
    const { logout, user, hasRole, hasPermission } = useAuth();
    const [rawMenuGroups, setRawMenuGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSidebar = async () => {
            try {
                const response = await api.get('/menus/sidebar');
                if (response.data && response.data.items) {
                    setRawMenuGroups(response.data.items);
                }
            } catch (error) {
                console.error("Failed to fetch sidebar menu", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSidebar();
    }, []);

    const isCollapsed = useSelector(selectIsCollapsed);
    const toggleSidebar = () => dispatch(toggleSidebarAction());
    const settings = useSelector(selectSettings);
    const location = useLocation();

    // Filter Groups and Items
    const menuGroups = rawMenuGroups.map(group => {
        const filteredItems = (group.children || []).filter(item => {
            if (!item.permission_name) return true;
            return hasPermission ? hasPermission(item.permission_name) : true;
        });
        if (filteredItems.length === 0) return null;
        return { ...group, items: filteredItems };
    }).filter(group => group !== null);

    // Icon renderer helper
    const renderIcon = (iconName) => {
        if (!iconName) return <LucideIcons.Circle size={8} />;
        const IconComponent = LucideIcons[iconName];
        return IconComponent ? <IconComponent size={20} /> : <LucideIcons.Circle size={8} />;
    };

    return (
        <div className={`${isCollapsed ? 'w-20' : 'w-64'} text-white h-full flex flex-col shadow-xl transition-all duration-300`} style={{ backgroundColor: 'var(--primary-color)' }}>
            {/* Brand */}
            <Link to="/" className={`h-16 flex-shrink-0 flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-6 space-x-3'} bg-black/20 border-b border-white/10 transition-all duration-300 hover:bg-black/30 cursor-pointer`}>
                <img
                    src={settings.logo_path ? `/storage/${settings.logo_path}` : "https://i0.wp.com/www.uim.ac.id/uimv2/wp-content/uploads/2020/10/Ico.png"}
                    alt="Logo"
                    className="h-10 w-10 object-contain"
                />
                {!isCollapsed && <span className="text-xl font-bold tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">{settings.system_name}</span>}
            </Link>

            {/* Menu */}
            <div className="flex-grow py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-green-800 hover:scrollbar-thumb-green-700">
                {isLoading ? (
                    <div className="p-4 text-center text-green-200 opacity-70">
                        Memuat menu...
                    </div>
                ) : (
                    menuGroups.map((group, index) => (
                        <div key={index} className="mb-6">
                            {!isCollapsed && (
                                <h3 className="px-6 text-xs font-semibold text-green-200 uppercase tracking-wider mb-2 whitespace-nowrap overflow-hidden">
                                    {group.title}
                                </h3>
                            )}
                            {/* Divider for collapsed mode to separate groups visually */}
                            {isCollapsed && index > 0 && <div className="mx-4 border-t border-green-800 my-2"></div>}

                            <div className="space-y-1">
                                {group.items.map((item, itemIndex) => {
                                    const isActive = (path) => {
                                        if (path === '/dashboard') return location.pathname === '/dashboard';
                                        return location.pathname.startsWith(path);
                                    };
                                    const active = isActive(item.url);
                                    
                                    return (
                                        <Link
                                            key={itemIndex}
                                            to={item.url}
                                            className={`group flex items-center h-10 transition-colors mx-3 rounded-lg overflow-hidden relative ${
                                                active
                                                    ? 'bg-white/20 text-white'
                                                    : 'text-green-100 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />}
                                            <div className="flex items-center justify-center w-12 h-full">
                                                {renderIcon(item.icon)}
                                            </div>
                                            {!isCollapsed && (
                                                <span className="text-sm font-medium tracking-wide">
                                                    {item.title}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
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

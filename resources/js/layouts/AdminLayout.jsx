import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DateTimePeriod from '../components/DateTimePeriod';
import NotificationDropdown from '../components/NotificationDropdown';
import ProfileDropdown from '../components/ProfileDropdown';
import { useAuth } from '../hooks/useAuth';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsCollapsed, toggleSidebar as toggleSidebarAction } from '../store/slices/sidebarSlice';
import { Menu, Bell } from 'lucide-react';

export default function AdminLayout() {
    const { user } = useAuth();
    const dispatch = useDispatch();
    const isCollapsed = useSelector(selectIsCollapsed);
    const toggleSidebar = () => dispatch(toggleSidebarAction());

    // Dynamic classes based on collapsed state
    const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
    const mainContentPadding = isCollapsed ? 'pl-20' : 'pl-64';
    const headerLeft = isCollapsed ? 'left-20' : 'left-64';

    return (
        <div className="min-h-screen bg-gray-100 flex transition-all duration-300">
            {/* Sidebar - Fixed */}
            <div className={`fixed inset-y-0 left-0 ${sidebarWidth} z-30 transition-all duration-300`}>
                <Sidebar />
            </div>

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col min-w-0 ${mainContentPadding} transition-all duration-300`}>
                {/* Top Header - Fixed */}
                <header className={`fixed top-0 right-0 ${headerLeft} z-20 bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-200 transition-all duration-300`}>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={toggleSidebar}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                    
                    {/* Date, Time & Period Info */}
                    <div className="flex-1 flex justify-center">
                        <DateTimePeriod />
                    </div>
                    
                    <div className="flex items-center">
                        <NotificationDropdown />
                        <ProfileDropdown />
                    </div>
                </header>

                {/* Page Content - with top padding for fixed header */}
                <main className="flex-1 p-6 mt-16 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

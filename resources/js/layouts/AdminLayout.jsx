import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import useAuthStore from '../store/useAuthStore';
import { Menu } from 'lucide-react';

export default function AdminLayout() {
    const { user } = useAuthStore();

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-200">
                    <button className="md:hidden text-gray-500 hover:text-gray-700">
                        <Menu size={24} />
                    </button>
                    <div className="ml-auto flex items-center">
                        <div className="flex items-center space-x-2">
                             <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden md:block">
                                {user?.name}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

import React, { useState, useEffect, useRef } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProfileDropdown() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleLogout = () => {
        setIsOpen(false);
        logout();
    };

    if (!user) return null;

    return (
        <div className="relative ml-4" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 focus:outline-none hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
            >
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200">
                    {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-700 leading-none">{user.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 capitalize">{user.role}</p>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-gray-50 md:hidden">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    
                    <Link 
                        to="/profile" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    >
                        <User size={16} className="mr-2" />
                        Profil
                    </Link>
                    
                    {/* Only show Settings for Admin or valid roles if needed. For now showing for all but linking to admin settings */}
                    {user.role === 'admin' && (
                        <Link 
                            to="/admin/settings" 
                            onClick={() => setIsOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600"
                        >
                            <Settings size={16} className="mr-2" />
                            Setting
                        </Link>
                    )}

                    <div className="border-t border-gray-50 my-1"></div>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                        <LogOut size={16} className="mr-2" />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}

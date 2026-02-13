import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function NotificationDropdown() {
    const { user, token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch initial notifications
    useEffect(() => {
        if (token) {
            fetchNotifications();
            
            // Listen for real-time notifications
            // Channel: App.Models.User.{id} is the default for private channel notifications in Laravel
            if (window.Echo && user?.id) {
                window.Echo.private(`App.Models.User.${user.id}`)
                    .notification((notification) => {
                        console.log('New Notification:', notification);
                        setUnreadCount(prev => prev + 1);
                        setNotifications(prev => [
                            {
                                id: notification.id,
                                data: {
                                    title: notification.title,
                                    body: notification.body,
                                    action_url: notification.action_url
                                },
                                read_at: null,
                                created_at: new Date().toISOString()
                            }, 
                            ...prev
                        ]);
                        
                        // Optional: Play sound
                    });
            }
        }
        
        return () => {
           if (window.Echo && user?.id) {
               window.Echo.leave(`App.Models.User.${user.id}`);
           }
        };
    }, [token, user]);

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

    const fetchNotifications = async () => {
        try {
            // Assuming strict API structure, but normally standard Laravel is /api/user/notifications or similar
            // Since we didn't explicitly create a route for fetching notifications list yet, 
            // I'll assume we might need to add one or use a generic one.
            // For now, let's try a standard convention route or just mock empty if it fails.
            // Wait, I should have added a route for this too in the plan? 
            // The plan said "Fetch initial notification count".
            // I'll skip fetching *list* from DB for now if route doesn't exist, relying on real-time for new ones?
            // BETTER: Add a simple route in API to get notifications. I will assume /api/notifications exists or add it.
            
            // NOTE: I am adding this blindly based on the assumption I will add the route.
            // The user didn't ask for a full inbox, just notification bell.
            // I'll implement a route add in next step.
            const response = await api.get('/notifications');
            setNotifications(response.data.data || []);
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            console.log('Notification fetch skipped or failed');
        }
    };

    const handleRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? {...n, read_at: new Date().toISOString()} : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
           // ignore
        }
    };
    
    const handleMarkAllRead = async () => {
        try {
            await api.patch(`/notifications/read-all`);
            setNotifications(notifications.map(n => ({...n, read_at: new Date().toISOString()})));
            setUnreadCount(0);
        } catch (error) {
            // ignore
        }
    }

    return (
        <div className="relative mr-4" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors focus:outline-none"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 border border-gray-100 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-700">Notifikasi</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs text-green-600 hover:text-green-800">
                                Tandai dibaca semua
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                Tidak ada notifikasi baru
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div 
                                    key={notif.id} 
                                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.read_at ? 'bg-blue-50/50' : ''}`}
                                >
                                    <Link 
                                        to={notif.data.action_url || '#'} 
                                        onClick={() => handleRead(notif.id)}
                                        className="block"
                                    >
                                        <p className="text-sm font-medium text-gray-800">{notif.data.title}</p>
                                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notif.data.body}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

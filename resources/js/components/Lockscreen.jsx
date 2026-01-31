import React, { useState, useEffect } from 'react';
import { Lock, Mail, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Lockscreen({ user, onUnlock, onLogout }) {
    const [email, setEmail] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds

    useEffect(() => {
        // Countdown timer
        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [onLogout]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUnlocking(true);

        try {
            await onUnlock(email);
            toast.success('Layar berhasil dibuka!');
        } catch (error) {
            toast.error(error.message || 'Gagal membuka layar');
        } finally {
            setIsUnlocking(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center z-50">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}></div>
            </div>

            {/* Lockscreen Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
                {/* Lock Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-6 rounded-full">
                        <Lock className="w-12 h-12 text-green-700" />
                    </div>
                </div>

                {/* User Info */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Layar Terkunci</h2>
                    <p className="text-gray-600 mb-1">Selamat datang kembali,</p>
                    <p className="text-lg font-semibold text-green-700">{user?.name}</p>
                </div>

                {/* Countdown Timer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center justify-center space-x-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                        Auto-logout dalam: <strong className="text-lg font-mono">{formatTime(timeRemaining)}</strong>
                    </span>
                </div>

                {/* Unlock Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Masukkan email Anda untuk membuka layar
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder={user?.email || "email@example.com"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isUnlocking}
                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                            isUnlocking ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                    >
                        {isUnlocking ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Membuka...
                            </>
                        ) : (
                            'Buka Layar'
                        )}
                    </button>
                </form>

                {/* Help Text */}
                <p className="mt-6 text-center text-xs text-gray-500">
                    Layar terkunci karena tidak ada aktivitas selama 30 menit.<br />
                    Masukkan email Anda untuk melanjutkan sesi.
                </p>
            </div>
        </div>
    );
}

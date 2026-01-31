import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-toastify';

const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,
    isLocked: false,
    lastActivity: Date.now(),

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const { access_token, user } = response.data;
            
            localStorage.setItem('token', access_token);
            set({ 
                user, 
                token: access_token, 
                isAuthenticated: true, 
                isLoading: false 
            });
            
            toast.success(`Selamat datang, ${user.name}! 👋`);
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Login gagal. Periksa email dan password Anda.';
            set({ 
                isLoading: false, 
                error: errorMessage
            });
            toast.error(errorMessage);
            return false;
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await axios.post('/api/auth/logout', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.removeItem('token');
            set({ 
                user: null, 
                token: null, 
                isAuthenticated: false, 
                isLoading: false 
            });
            toast.success('Anda telah logout. Sampai jumpa! 👋');
        }
    },

    lockScreen: () => {
        set({ isLocked: true });
        toast.warning('Layar terkunci karena tidak ada aktivitas selama 30 menit', {
            autoClose: 5000
        });
    },

    unlockScreen: async (email) => {
        const { user, token } = get();
        
        // Validate email locally (no need for backend validation)
        if (!user || user.email !== email) {
            throw new Error('Email tidak sesuai dengan akun Anda');
        }

        try {
            // Use existing refresh endpoint to extend session
            const response = await axios.post('/api/auth/refresh', 
                {}, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            
            set({ 
                token: access_token,
                isLocked: false,
                lastActivity: Date.now()
            });
            
            return true;
        } catch (error) {
            if (error.response?.status === 401) {
                // Token expired, force logout
                get().logout();
                throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
            }
            throw new Error(error.response?.data?.error || 'Gagal membuka layar');
        }
    },

    fetchUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.post('/api/auth/me', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ user: response.data, isAuthenticated: true });
        } catch (error) {
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false });
        }
    }
}));

export default useAuthStore;

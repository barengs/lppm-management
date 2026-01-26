import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,

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
            return true;
        } catch (error) {
            set({ 
                isLoading: false, 
                error: error.response?.data?.error || 'Login failed' 
            });
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

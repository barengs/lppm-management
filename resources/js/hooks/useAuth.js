import { useSelector, useDispatch } from 'react-redux';
import { useLoginMutation, useLogoutMutation, useGetMeMutation, useRefreshTokenMutation } from '../store/api/authApi';
import { selectCurrentUser, selectToken, selectIsAuthenticated, selectIsLocked } from '../store/slices/authSlice';
import { lockScreen as lockScreenAction, unlockScreen as unlockScreenAction } from '../store/slices/authSlice';
import { toast } from 'react-toastify';

/**
 * Custom hook for authentication
 * Replaces useAuthStore from Zustand
 */
export const useAuth = () => {
    const dispatch = useDispatch();
    
    // Selectors
    const user = useSelector(selectCurrentUser);
    const token = useSelector(selectToken);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isLocked = useSelector(selectIsLocked);
    
    // Mutations
    const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
    const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();
    const [refreshTokenMutation] = useRefreshTokenMutation();
    const [getMeMutation] = useGetMeMutation();
    
    /**
     * Login user
     * @param {string} email
     * @param {string} password
     * @returns {Promise<boolean>} success status
     */
    const login = async (email, password) => {
        try {
            const response = await loginMutation({ email, password }).unwrap();
            return response.user; // Return user object directly
        } catch (error) {
            return null;
        }
    };
    
    /**
     * Logout user
     */
    const logout = async () => {
        try {
            await logoutMutation().unwrap();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    
    /**
     * Lock screen
     */
    const lockScreen = () => {
        dispatch(lockScreenAction());
        toast.warning('Layar terkunci karena tidak ada aktivitas selama 30 menit', {
            autoClose: 5000
        });
    };
    
    /**
     * Unlock screen
     * @param {string} email - Email for validation
     * @returns {Promise<boolean>} success status
     */
    const unlockScreen = async (email) => {
        if (!user || user.email !== email) {
            throw new Error('Email tidak sesuai dengan akun Anda');
        }
        
        try {
            await refreshTokenMutation().unwrap();
            return true;
        } catch (error) {
            if (error.status === 401) {
                throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
            }
            throw new Error(error.data?.error || 'Gagal membuka layar');
        }
    };
    
    /**
     * Fetch user profile
     */
    const fetchUser = async () => {
        if (!token) return;
        
        try {
            await getMeMutation().unwrap();
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };
    
    return {
        // State
        user,
        token,
        isAuthenticated,
        isLocked,
        isLoading: isLoggingIn || isLoggingOut,
        error: null,
        
        // Actions
        login,
        logout,
        lockScreen,
        unlockScreen,
        fetchUser,
    };
};

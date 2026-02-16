import { baseApi } from './baseApi';
import { setCredentials, logout as logoutAction, unlockScreen } from '../slices/authSlice';
import { toast } from 'react-toastify';

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: ({ email, password, recaptcha_token }) => ({
                url: '/auth/login',
                method: 'POST',
                body: { email, password, recaptcha_token },
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    const { access_token, user } = data;
                    
                    // Update Redux state
                    dispatch(setCredentials({ user, token: access_token }));
                    
                    // Show success toast
                    toast.success(`Selamat datang, ${user.name}! 👋`);
                } catch (error) {
                    const errorMessage = error.error?.data?.error || 'Login gagal. Periksa email dan password Anda.';
                    toast.error(errorMessage);
                    throw error;
                }
            },
            invalidatesTags: ['User'],
        }),

        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error('Logout failed', error);
                } finally {
                    dispatch(logoutAction());
                    toast.success('Anda telah logout. Sampai jumpa! 👋');
                }
            },
            invalidatesTags: ['User'],
        }),

        getMe: builder.mutation({
            query: () => ({
                url: '/auth/me',
                method: 'POST',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials({ user: data, token: null }));
                } catch (error) {
                    // If getMe fails, logout
                    dispatch(logoutAction());
                }
            },
        }),

        refreshToken: builder.mutation({
            query: () => ({
                url: '/auth/refresh',
                method: 'POST',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    const { access_token } = data;
                    
                    dispatch(setCredentials({ 
                        token: access_token,
                        user: null // Keep existing user
                    }));
                    
                    dispatch(unlockScreen());
                } catch (error) {
                    // Token refresh failed, logout
                    dispatch(logoutAction());
                    throw error;
                }
            },
        }),

        getProfile: builder.query({
            query: () => '/profile/me',
            providesTags: ['User'],
        }),
    }),
});

export const {
    useLoginMutation,
    useLogoutMutation,
    useGetMeMutation,
    useRefreshTokenMutation,
    useGetProfileQuery,
} = authApi;

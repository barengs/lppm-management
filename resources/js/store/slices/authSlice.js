import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLocked: false,
    lastActivity: Date.now(),
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            
            // Only update user if provided (not null/undefined)
            if (user !== undefined && user !== null) {
                state.user = user;
            }
            
            // Only update token if provided (not null/undefined)
            if (token !== undefined && token !== null) {
                state.token = token;
                localStorage.setItem('token', token);
            }
            
            state.isAuthenticated = true;
            state.error = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLocked = false;
            localStorage.removeItem('token');
        },
        lockScreen: (state) => {
            state.isLocked = true;
        },
        unlockScreen: (state) => {
            state.isLocked = false;
            state.lastActivity = Date.now();
        },
        updateLastActivity: (state) => {
            state.lastActivity = Date.now();
        },
    },
});

export const {
    setCredentials,
    setUser,
    logout,
    lockScreen,
    unlockScreen,
    updateLastActivity,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLocked = (state) => state.auth.isLocked;

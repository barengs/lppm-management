import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLocked: false,
    lastActivity: Date.now(),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            localStorage.setItem('token', action.payload.token);
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

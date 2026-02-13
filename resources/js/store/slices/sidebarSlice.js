import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage
const loadSidebarState = () => {
    try {
        const serialized = localStorage.getItem('sidebar-storage');
        if (serialized === null) {
            return { isCollapsed: false };
        }
        const parsed = JSON.parse(serialized);
        return { isCollapsed: parsed.state?.isCollapsed ?? false };
    } catch (err) {
        return { isCollapsed: false };
    }
};

const initialState = loadSidebarState();

const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.isCollapsed = !state.isCollapsed;
            // Persist to localStorage
            localStorage.setItem('sidebar-storage', JSON.stringify({
                state: { isCollapsed: state.isCollapsed }
            }));
        },
        setCollapsed: (state, action) => {
            state.isCollapsed = action.payload;
            // Persist to localStorage
            localStorage.setItem('sidebar-storage', JSON.stringify({
                state: { isCollapsed: state.isCollapsed }
            }));
        },
    },
});

export const { toggleSidebar, setCollapsed } = sidebarSlice.actions;

export default sidebarSlice.reducer;

// Selectors
export const selectIsCollapsed = (state) => state.sidebar.isCollapsed;

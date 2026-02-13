import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    sidebarOpen: true,
    settings: {
        system_name: 'LPPM UIM',
        description: 'Lembaga Penelitian dan Pengabdian kepada Masyarakat',
        address: 'Kompleks Pondok Pesantren Miftahul Ulum, Bettet, Pamekasan, Jawa Timur.',
        email: 'lppm@uim.ac.id',
        phone: '(0324) 321706',
        logo_path: null,
        favicon_path: null,
        theme_color: '#004d40',
    },
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload;
        },
        setSettings: (state, action) => {
            state.settings = { ...state.settings, ...action.payload };
        },
    },
});

export const { toggleSidebar, setSidebarOpen, setSettings } = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectSettings = (state) => state.ui.settings;

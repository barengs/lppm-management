import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    settings: {
        system_name: 'LPPM UIM',
        university_name: 'Universitas Islam Madura',
        description: 'Lembaga Penelitian dan Pengabdian kepada Masyarakat',
        address: 'Kompleks Pondok Pesantren Miftahul Ulum, Bettet, Pamekasan, Jawa Timur.',
        email: 'lppm@uim.ac.id',
        phone: '(0324) 321706',
        logo_path: null,
        favicon_path: null,
        theme_color: '#004d40',
    },
};

const systemSlice = createSlice({
    name: 'system',
    initialState,
    reducers: {
        setSettings: (state, action) => {
            state.settings = { ...state.settings, ...action.payload };
        },
        resetSettings: (state) => {
            state.settings = initialState.settings;
        },
    },
});

export const { setSettings, resetSettings } = systemSlice.actions;

export default systemSlice.reducer;

// Selectors
export const selectSettings = (state) => state.system.settings;
export const selectSystemName = (state) => state.system.settings.system_name;
export const selectThemeColor = (state) => state.system.settings.theme_color;

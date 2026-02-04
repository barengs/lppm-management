import { create } from 'zustand';

const useSystemStore = create((set) => ({
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
    setSettings: (settings) => set((state) => ({ 
        settings: { ...state.settings, ...settings } 
    })),
}));

export default useSystemStore;

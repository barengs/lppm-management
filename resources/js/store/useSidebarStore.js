import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSidebarStore = create(
    persist(
        (set) => ({
            isCollapsed: false,
            toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
            setCollapsed: (val) => set({ isCollapsed: val }),
        }),
        {
            name: 'sidebar-storage', // unique name
            getStorage: () => localStorage, 
        }
    )
);

export default useSidebarStore;

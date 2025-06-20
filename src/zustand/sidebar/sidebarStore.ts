import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export interface SidebarState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const useSidebar = create<SidebarState>()(
  devtools(
    persist(
      (set) => ({
        isSidebarOpen: false,
        toggleSidebar: () =>
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
        setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      }),
      {
        name: 'sidebar-storage',
      }
    ),
    { name: 'SidebarStore' }
  )
);

export const useSidebarState = () => useSidebar((state) => state);

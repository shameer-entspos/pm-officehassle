import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export interface SidebarState {
  tab: string;
  changeTab: (tab: string) => void;
}

export const useProjectTabs = create<SidebarState>()(
  devtools(
    persist(
      (set) => ({
        tab: 'Overview',
        changeTab: (tab) => set({ tab }),
      }),
      {
        name: 'tabs-storage',
      }
    ),
    { name: 'ProjectTabsStore' }
  )
);

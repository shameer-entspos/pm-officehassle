import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Name {
  name?: string;
}

interface PageNameState {
  name: Name;
  setName: (name: string) => void;
}

export const usePageNameStore = create<PageNameState>()(
  devtools(
    persist(
      (set) => ({
        name: { name: '' },
        setName: (newName: string) => set({ name: { name: newName } }),
      }),
      {
        name: 'page-name',
      }
    )
  )
);

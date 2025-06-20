import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_no?: string;
  cnic?: string;
  photo?: string;
  city?: string;
  provience?: string;
  country?: string;
  address?: string;
  domain?: string;
  project_name?: string;
  custom_projects?: string;
  description?: string;
  attachement?: string;
  is_custom?: boolean;
  projects?: { id: string; title?: string }[];
}

interface ClientState {
  client: Client | null;
  clients: Client[];
  setClient: (client: Client) => void;
  clearClient: () => void;
  addClient: (client: Client) => void;
  removeClient: (id: string) => void;
  setClients: (clients: Client[]) => void;
  clearClients: () => void;
}

export const useClientStore = create<ClientState>()(
  devtools(
    persist(
      (set) => ({
        client: null,
        clients: [],

        setClient: (client) => set({ client }),
        clearClient: () => set({ client: null }),

        addClient: (client) =>
          set((state) => {
            const exists = state.clients.some((c) => c.id === client.id);
            if (exists) return state;
            return { clients: [...state.clients, client] };
          }),

        removeClient: (id) =>
          set((state) => ({
            clients: state.clients.filter((c) => c.id !== id),
          })),

        setClients: (clients) => set({ clients }),

        clearClients: () => set({ clients: [] }),
      }),
      {
        name: 'client-storage',
      }
    )
  )
);

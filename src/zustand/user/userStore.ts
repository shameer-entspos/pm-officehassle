// src/store/useProfile.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface CompanyContacts {
  id: number;
  mobile_numbers: string;
  emails: string;
  sites: string;
  address: string | null;
  user: number;
}

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  username: string | null;
  email: string;
  phone_no: string;
  company_name?: string;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  address?: string;
  about?: string | null;
  photo?: string;
  company_logo?: string | null;
  is_active?: boolean;
  currency?: string;
  smtp_email?: string | null;
  smtp_email_password?: string | null;
  role?: string;
  two_factor_auth?: boolean;
  is_superuser?: boolean;
  is_staff?: boolean;
  company_contacts?: CompanyContacts;
  has_subscription?: boolean;
  github_username?: string | null;
  allowAllMembersToChannel?: boolean;
}

interface UserState {
  profile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  clearUserProfile: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

export const useProfile = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        profile: null,

        setUserProfile: (profile: UserProfile) => set({ profile }),

        clearUserProfile: () => set({ profile: null }),

        updateUserProfile: (updates: Partial<UserProfile>) =>
          set((state) => ({
            profile: state.profile ? { ...state.profile, ...updates } : null,
          })),
      }),
      {
        name: 'user-storage',
      }
    ),
    { name: 'UserStore' }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CRMProvider = 'hubspot' | 'zoho' | 'salesforce';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  picture?: string | null;
  credits: number;
}

interface AppState {
  // Provider & Connection
  provider: CRMProvider;
  setProvider: (provider: CRMProvider) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;

  // Search results
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: any[];
  setSearchResults: (results: any[]) => void;
  clearSearchResults: () => void;

  // API URL
  apiUrl: string;
  setApiUrl: (url: string) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Auth
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  credits: number;
  setCredits: (credits: number) => void;

  // Notifications
  message: string | null;
  messageType: 'success' | 'error' | 'info' | 'warning' | null;
  setMessage: (message: string | null, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
  provider: 'hubspot',
  setProvider: (provider) => set({ provider }),

  isConnected: false,
  setIsConnected: (connected) => set({ isConnected: connected }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  searchResults: [],
  setSearchResults: (results) => set({ searchResults: results }),
  clearSearchResults: () => set({ searchResults: [] }),

  apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  setApiUrl: (url) => set({ apiUrl: url }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  user: null,
  setUser: (user) => set({ user, credits: user?.credits ?? 0 }),
  credits: 0,
  setCredits: (credits) => set({ credits }),

  message: null,
  messageType: null,
  setMessage: (message, type = 'info') => set({ message, messageType: type }),
    }),
    {
      name: 'leadgen-store',
      version: 2,
      partialize: (state) => ({
      }),
      migrate: () => ({}),
    }
  )
);

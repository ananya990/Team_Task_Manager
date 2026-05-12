import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiStore {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (
    theme: 'light' | 'dark' | 'system'
  ) => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',

      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),

      setSidebarOpen: (sidebarOpen) =>
        set({ sidebarOpen }),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'taskmanager-ui',
    }
  )
);
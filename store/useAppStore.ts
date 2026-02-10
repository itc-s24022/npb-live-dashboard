import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FilterSettings, AppSettings, TeamId } from '@/types';

interface AppStore {
  filter: FilterSettings;
  settings: AppSettings;
  uiState: {
    isTeamSelectorOpen: boolean;
    isYearSelectorOpen: boolean;
  };
  setSelectedTeam: (team: TeamId | 'all') => void;
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setFavoriteTeam: (team: TeamId | null) => void;
  setAutoUpdate: (enabled: boolean) => void;
  toggleTeamSelector: () => void;
  toggleYearSelector: () => void;
  closeAllModals: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      filter: {
        selectedTeam: 'tigers',
        selectedYear: 2025,
        selectedMonth: 6,
      },
      settings: {
        theme: 'dark',
        favoriteTeam: 'tigers',
        autoUpdate: true,
      },
      uiState: {
        isTeamSelectorOpen: false,
        isYearSelectorOpen: false,
      },
      setSelectedTeam: (team) =>
        set((state) => ({
          filter: { ...state.filter, selectedTeam: team },
        })),
      setSelectedYear: (year) =>
        set((state) => ({
          filter: { ...state.filter, selectedYear: year },
        })),
      setSelectedMonth: (month) =>
        set((state) => ({
          filter: { ...state.filter, selectedMonth: month },
        })),
      setTheme: (theme) =>
        set((state) => ({
          settings: { ...state.settings, theme },
        })),
      setFavoriteTeam: (team) =>
        set((state) => ({
          settings: { ...state.settings, favoriteTeam: team },
          filter: { ...state.filter, selectedTeam: team || 'all' },
        })),
      setAutoUpdate: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, autoUpdate: enabled },
        })),
      toggleTeamSelector: () =>
        set((state) => ({
          uiState: {
            ...state.uiState,
            isTeamSelectorOpen: !state.uiState.isTeamSelectorOpen,
            isYearSelectorOpen: false,
          },
        })),
      toggleYearSelector: () =>
        set((state) => ({
          uiState: {
            ...state.uiState,
            isYearSelectorOpen: !state.uiState.isYearSelectorOpen,
            isTeamSelectorOpen: false,
          },
        })),
      closeAllModals: () =>
        set((state) => ({
          uiState: {
            isTeamSelectorOpen: false,
            isYearSelectorOpen: false,
          },
        })),
    }),
    {
      name: 'npb-live-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

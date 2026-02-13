import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FilterSettings, AppSettings, TeamId } from '@/types';

interface AppState {
  filter: FilterSettings;
  settings: AppSettings;
  showYearSelector: boolean;
  showTeamSelector: boolean;
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedTeam: (team: TeamId | 'all') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setFavoriteTeam: (team: TeamId | null) => void;
  setAutoUpdate: (autoUpdate: boolean) => void;
  toggleYearSelector: () => void;
  toggleTeamSelector: () => void;
}

// デフォルトは2025年4月（NPBシーズン開始）
const DEFAULT_YEAR = 2025;
const DEFAULT_MONTH = 4;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      filter: {
        selectedTeam: 'all',
        selectedYear: DEFAULT_YEAR,
        selectedMonth: DEFAULT_MONTH,
      },
      settings: {
        theme: 'dark',
        favoriteTeam: null,
        autoUpdate: true,
      },
      showYearSelector: false,
      showTeamSelector: false,

      setSelectedYear: (year) =>
        set((state) => ({
          filter: { ...state.filter, selectedYear: year },
        })),

      setSelectedMonth: (month) =>
        set((state) => ({
          filter: { ...state.filter, selectedMonth: month },
        })),

      setSelectedTeam: (team) =>
        set((state) => ({
          filter: { ...state.filter, selectedTeam: team },
          showTeamSelector: false,
        })),

      setTheme: (theme) =>
        set((state) => ({
          settings: { ...state.settings, theme },
        })),

      setFavoriteTeam: (team) =>
        set((state) => ({
          settings: { ...state.settings, favoriteTeam: team },
          showTeamSelector: false,
        })),

      setAutoUpdate: (autoUpdate) =>
        set((state) => ({
          settings: { ...state.settings, autoUpdate },
        })),

      toggleYearSelector: () =>
        set((state) => ({
          showYearSelector: !state.showYearSelector,
          showTeamSelector: false,
        })),

      toggleTeamSelector: () =>
        set((state) => ({
          showTeamSelector: !state.showTeamSelector,
          showYearSelector: false,
        })),
    }),
    {
      name: 'npb-live-storage',
      partialize: (state) => ({
        filter: state.filter,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 不正な値をクリーンアップ
          if (!state.filter.selectedTeam || 
              (state.filter.selectedTeam !== 'all' && 
               !['giants', 'hanshin', 'dragons', 'baystars', 'carp', 'swallows', 
                 'hawks', 'marines', 'fighters', 'eagles', 'buffaloes', 'lions'].includes(state.filter.selectedTeam))) {
            state.filter.selectedTeam = 'all';
          }
          
          // 年が未来の場合はデフォルトに戻す
          if (state.filter.selectedYear > 2025) {
            state.filter.selectedYear = DEFAULT_YEAR;
            state.filter.selectedMonth = DEFAULT_MONTH;
          }
        }
      },
    }
  )
);

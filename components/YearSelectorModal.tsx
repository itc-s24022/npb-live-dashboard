'use client';

import { X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];

export default function YearSelectorModal() {
  const { uiState, closeAllModals, filter, setSelectedYear } = useAppStore();

  if (!uiState.isYearSelectorOpen) return null;

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    closeAllModals();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-light-card dark:bg-dark-card w-full sm:max-w-md sm:rounded-lg rounded-t-2xl">
        {/* Header */}
        <div className="border-b border-light-border dark:border-dark-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">年度を選択</h2>
          <button
            onClick={closeAllModals}
            className="p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-900 dark:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            {YEARS.map((year) => (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  filter.selectedYear === year
                    ? 'border-primary-green bg-primary-green/10'
                    : 'border-light-border dark:border-dark-border hover:border-primary-green'
                }`}
              >
                <span
                  className={`text-lg font-bold ${
                    filter.selectedYear === year
                      ? 'text-primary-green'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {year}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

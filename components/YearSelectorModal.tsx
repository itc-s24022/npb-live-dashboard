'use client';

import { X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function YearSelectorModal() {
  const { showYearSelector, toggleYearSelector, filter, setSelectedYear } = useAppStore();

  if (!showYearSelector) return null;

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    toggleYearSelector();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={toggleYearSelector}
    >
      <div
        className="bg-light-card dark:bg-dark-card rounded-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">年を選択</h2>
          <button
            onClick={toggleYearSelector}
            className="p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
        </div>

        {/* Years List */}
        <div className="p-4 grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {years.map((year) => {
            const isSelected = year === filter.selectedYear;
            return (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                className={`py-3 rounded-lg font-bold transition-colors ${
                  isSelected
                    ? 'bg-primary-green text-white'
                    : 'bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {year}年
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

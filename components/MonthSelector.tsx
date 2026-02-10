'use client';

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function MonthSelector() {
  const { filter, toggleYearSelector, setSelectedMonth } = useAppStore();
  const { selectedYear, selectedMonth } = filter;

  const handleMonthChange = (increment: number) => {
    let newMonth = selectedMonth + increment;
    
    if (newMonth > 12) {
      newMonth = 1;
    } else if (newMonth < 1) {
      newMonth = 12;
    }
    
    setSelectedMonth(newMonth);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={() => handleMonthChange(-1)}
        className="p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-lg transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white" />
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleYearSelector}
          className="px-4 py-2 bg-light-bg dark:bg-dark-bg rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          <span className="font-bold">{selectedYear}年</span>
        </button>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {selectedMonth}月
        </span>
      </div>

      <button
        onClick={() => handleMonthChange(1)}
        className="p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-lg transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-gray-900 dark:text-white" />
      </button>
    </div>
  );
}

'use client';

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useState } from 'react';

export default function MonthSelector() {
  const { filter, toggleYearSelector, setSelectedMonth } = useAppStore();
  const { selectedYear, selectedMonth } = filter;
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const handleMonthChange = (increment: number) => {
    let newMonth = selectedMonth + increment;
    
    if (newMonth > 12) {
      newMonth = 1;
    } else if (newMonth < 1) {
      newMonth = 12;
    }
    
    setSelectedMonth(newMonth);
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setShowMonthPicker(false);
  };

  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  return (
    <>
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
          <button
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            className="px-4 py-2 bg-light-bg dark:bg-dark-bg rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-2xl font-bold">{selectedMonth}月</span>
          </button>
        </div>

        <button
          onClick={() => handleMonthChange(1)}
          className="p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
      </div>

      {/* 月選択モーダル */}
      {showMonthPicker && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowMonthPicker(false)}
        >
          <div
            className="bg-white dark:bg-dark-card rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              月を選択
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {months.map((month, index) => {
                const monthNum = index + 1;
                const isSelected = monthNum === selectedMonth;
                
                return (
                  <button
                    key={monthNum}
                    onClick={() => handleMonthSelect(monthNum)}
                    className={`py-3 rounded-lg font-bold transition-colors ${
                      isSelected
                        ? 'bg-primary-green text-white'
                        : 'bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowMonthPicker(false)}
              className="w-full mt-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}

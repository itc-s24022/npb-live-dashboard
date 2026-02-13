'use client';

import { useState } from 'react';
import { getLastUpdated, saveLastUpdated } from '@/lib/storage';

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(getLastUpdated());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      await onRefresh();
      const now = new Date();
      setLastUpdated(now);
      saveLastUpdated(now);
    } catch (error) {
      console.error('更新に失敗しました:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getRelativeTime = (date: Date | null): string => {
    if (!date) return '未更新';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'たった今';
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
    return `${Math.floor(diff / 86400)}日前`;
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      aria-label="データを更新"
    >
      <svg
        className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      <span className="text-sm">
        {isRefreshing ? '更新中...' : '更新'}
      </span>
      {lastUpdated && !isRefreshing && (
        <span className="text-xs opacity-80">
          ({getRelativeTime(lastUpdated)})
        </span>
      )}
    </button>
  );
};

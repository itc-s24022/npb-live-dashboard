'use client';

import { useState, useEffect } from 'react';
import { NotificationModal } from './NotificationModal';
import { getNotificationSettings } from '@/lib/storage';

export const NotificationButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const settings = getNotificationSettings();
    setIsEnabled(settings.enabled);
  }, [isModalOpen]);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-full transition-colors"
        aria-label="通知設定"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-600 dark:text-gray-400"
        >
          <path d="M10.268 21a2 2 0 0 0 3.464 0" />
          <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
        </svg>
        {/* 通知が有効な場合は赤丸を表示 */}
        {isEnabled && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {isModalOpen && (
        <NotificationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

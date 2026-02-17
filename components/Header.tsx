'use client';

import { NotificationButton } from './NotificationButton';

export default function Header() {
  const handleRefresh = async () => {
    // キャッシュバスティング付きでページをリロード
    window.location.href = `${window.location.pathname}?bustCache=${Date.now()}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* 左側: ロゴ */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            NPB Live
          </h1>
        </div>

        {/* 右側: ボタン */}
        <div className="flex items-center gap-2">
          {/* ⚡更新ボタン */}
          <button
            onClick={handleRefresh}
            className="relative p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-full transition-colors"
            aria-label="データを更新"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-yellow-400"
            >
              <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
            </svg>
          </button>

          {/* 🔔通知ボタン */}
          <NotificationButton />
        </div>
      </div>
    </header>
  );
}

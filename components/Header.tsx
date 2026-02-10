'use client';

import { Bell, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border z-50">
      <div className="flex items-center justify-between h-14 px-4 max-w-screen-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">NPB Live</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-full transition-colors">
            <Zap size={20} className="text-yellow-400" fill="currentColor" />
          </button>
          <button className="relative p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-full transition-colors">
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}

'use client';

import { useAppStore } from '@/store/useAppStore';
import { useEffect } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useAppStore();

  useEffect(() => {
    // 初回マウント時にテーマを適用
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  return <>{children}</>;
}

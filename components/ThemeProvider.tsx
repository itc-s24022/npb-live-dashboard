'use client';

import { useAppStore } from '@/store/useAppStore';
import { useEffect, useState } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const body = document.body;
    if (settings.theme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
      body.style.backgroundColor = '#1a1d29';
      body.style.color = 'white';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      body.style.backgroundColor = '#f5f5f5';
      body.style.color = '#1a1d29';
    }
  }, [settings.theme, mounted]);

  return <>{children}</>;
}

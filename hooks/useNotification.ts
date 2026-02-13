'use client';

import { useEffect, useState } from 'react';
import { Game, NotificationSettings } from '@/types/notification';
import {
  getNotificationSettings,
  saveNotificationSettings,
  cleanOldNotifications,
} from '@/lib/storage';
import {
  requestNotificationPermission,
  checkAllNotifications,
} from '@/lib/notification';

export const useNotification = (games: Game[]) => {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());

  const updateSettings = async (newSettings: NotificationSettings) => {
    if (newSettings.enabled && !settings.browserNotificationEnabled) {
      const granted = await requestNotificationPermission();
      newSettings.browserNotificationEnabled = granted;
    }

    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  useEffect(() => {
    if (!settings.enabled) return;

    checkAllNotifications(games, settings);

    const interval = setInterval(() => {
      checkAllNotifications(games, settings);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [games, settings]);

  useEffect(() => {
    cleanOldNotifications();
  }, []);

  return {
    settings,
    updateSettings,
  };
};

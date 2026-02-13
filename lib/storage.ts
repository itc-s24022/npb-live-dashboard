import { NotificationSettings } from '@/types/notification';

const STORAGE_KEYS = {
  NOTIFICATION_SETTINGS: 'npb_notification_settings',
  LAST_UPDATED: 'npb_last_updated',
  NOTIFIED_GAMES: 'npb_notified_games',
} as const;

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  favoriteTeams: [],
  notifyGameStart: true,
  notifyGameEnd: true,
  notifyDaily: false,
  dailyNotifyTime: '08:00',
  browserNotificationEnabled: false,
};

export const getNotificationSettings = (): NotificationSettings => {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS;
  
  const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
  if (!stored) return DEFAULT_NOTIFICATION_SETTINGS;
  
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
};

export const saveNotificationSettings = (settings: NotificationSettings): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
};

export const getLastUpdated = (): Date | null => {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
  return stored ? new Date(stored) : null;
};

export const saveLastUpdated = (date: Date): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, date.toISOString());
};

export const getNotifiedGames = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  
  const stored = localStorage.getItem(STORAGE_KEYS.NOTIFIED_GAMES);
  return stored ? new Set(JSON.parse(stored)) : new Set();
};

export const addNotifiedGame = (gameId: string): void => {
  if (typeof window === 'undefined') return;
  
  const notified = getNotifiedGames();
  notified.add(gameId);
  localStorage.setItem(STORAGE_KEYS.NOTIFIED_GAMES, JSON.stringify([...notified]));
};

export const cleanOldNotifications = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.NOTIFIED_GAMES);
};

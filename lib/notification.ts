import { Game, NotificationSettings } from '@/types/notification';
import { addNotifiedGame, getNotifiedGames } from './storage';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('このブラウザは通知をサポートしていません');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendNotification = (title: string, options?: NotificationOptions): void => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const notification = new Notification(title, {
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    ...options,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
};

export const isFavoriteGame = (
  game: Game,
  favoriteTeams: string[]
): boolean => {
  if (favoriteTeams.length === 0) return true;
  return favoriteTeams.includes(game.homeTeam) || favoriteTeams.includes(game.awayTeam);
};

export const checkGameStartNotifications = (
  games: Game[],
  settings: NotificationSettings
): void => {
  if (!settings.enabled || !settings.notifyGameStart) return;

  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const notifiedGames = getNotifiedGames();

  games.forEach((game) => {
    if (!isFavoriteGame(game, settings.favoriteTeams)) return;
    if (notifiedGames.has(`start-${game.id}`)) return;
    
    const startTime = new Date(game.startTime);
    
    if (startTime > now && startTime <= oneHourLater) {
      sendNotification(
        `🏟️ まもなく試合開始`,
        {
          body: `${game.awayTeam} vs ${game.homeTeam}\n${startTime.getHours()}:${String(startTime.getMinutes()).padStart(2, '0')}開始 at ${game.stadium}`,
          tag: `game-start-${game.id}`,
          requireInteraction: false,
        }
      );
      
      addNotifiedGame(`start-${game.id}`);
    }
  });
};

export const checkGameEndNotifications = (
  games: Game[],
  settings: NotificationSettings
): void => {
  if (!settings.enabled || !settings.notifyGameEnd) return;

  const notifiedGames = getNotifiedGames();

  games.forEach((game) => {
    if (!isFavoriteGame(game, settings.favoriteTeams)) return;
    if (notifiedGames.has(`end-${game.id}`)) return;
    
    if (game.status === 'finished' && game.homeScore !== undefined) {
      const isHomeWin = game.homeScore > (game.awayScore || 0);
      const winnerTeam = isHomeWin ? game.homeTeam : game.awayTeam;
      
      sendNotification(
        `🎉 試合終了！`,
        {
          body: `${game.awayTeam} ${game.awayScore} - ${game.homeScore} ${game.homeTeam}\n勝利: ${winnerTeam}`,
          tag: `game-end-${game.id}`,
          requireInteraction: true,
        }
      );
      
      addNotifiedGame(`end-${game.id}`);
    }
  });
};

export const checkDailySummaryNotification = (
  games: Game[],
  settings: NotificationSettings
): void => {
  if (!settings.enabled || !settings.notifyDaily) return;

  const now = new Date();
  const [hour, minute] = settings.dailyNotifyTime.split(':').map(Number);
  
  if (now.getHours() === hour && now.getMinutes() >= minute && now.getMinutes() < minute + 5) {
    const notifiedGames = getNotifiedGames();
    const today = now.toDateString();
    
    if (notifiedGames.has(`daily-${today}`)) return;
    
    const todayGames = games.filter((game) => {
      const gameDate = new Date(game.startTime).toDateString();
      return gameDate === today && isFavoriteGame(game, settings.favoriteTeams);
    });

    if (todayGames.length > 0) {
      const summary = todayGames
        .map((g) => `・${g.awayTeam} vs ${g.homeTeam}`)
        .join('\n');
      
      sendNotification(
        `📅 今日の試合（${todayGames.length}試合）`,
        {
          body: summary,
          tag: `daily-${today}`,
          requireInteraction: false,
        }
      );
      
      addNotifiedGame(`daily-${today}`);
    }
  }
};

export const checkAllNotifications = (games: Game[], settings: NotificationSettings): void => {
  checkGameStartNotifications(games, settings);
  checkGameEndNotifications(games, settings);
  checkDailySummaryNotification(games, settings);
};

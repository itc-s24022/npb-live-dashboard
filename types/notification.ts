export interface NotificationSettings {
  enabled: boolean;
  favoriteTeams: string[];
  notifyGameStart: boolean;
  notifyGameEnd: boolean;
  notifyDaily: boolean;
  dailyNotifyTime: string;
  browserNotificationEnabled: boolean;
}

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: 'scheduled' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
  stadium: string;
}

export const NPB_TEAMS = [
  '読売ジャイアンツ',
  '阪神タイガース',
  '中日ドラゴンズ',
  '横浜DeNAベイスターズ',
  '広島東洋カープ',
  '東京ヤクルトスワローズ',
  '福岡ソフトバンクホークス',
  '千葉ロッテマリーンズ',
  '埼玉西武ライオンズ',
  '東北楽天ゴールデンイーグルス',
  'オリックス・バファローズ',
  '北海道日本ハムファイターズ',
] as const;

export type NPBTeam = typeof NPB_TEAMS[number];

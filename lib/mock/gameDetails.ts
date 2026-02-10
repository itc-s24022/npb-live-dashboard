import { GameDetail } from '@/types';

export const MOCK_GAME_DETAIL_20250601: GameDetail = {
  id: 'g20250601-001',
  date: '2025-06-01',
  time: '14:00',
  homeTeam: 'baystars',
  awayTeam: 'swallows',
  homeScore: 3,
  awayScore: 2,
  status: 'finished',
  stadium: '横浜スタジアム',
  attendance: 33630,
  inningScores: [
    { inning: 1, away: 0, home: 0 },
    { inning: 2, away: 1, home: 0 },
    { inning: 3, away: 0, home: 0 },
    { inning: 4, away: 0, home: 2 },
    { inning: 5, away: 1, home: 0 },
    { inning: 6, away: 0, home: 0 },
    { inning: 7, away: 0, home: 1 },
    { inning: 8, away: 0, home: 0 },
    { inning: 9, away: 0, home: 0 },
  ],
  duration: '3時間12分',
};

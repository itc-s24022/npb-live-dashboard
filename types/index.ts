export type TeamId = 
  | 'giants' 
  | 'hanshin'
  | 'dragons' 
  | 'baystars' 
  | 'carp' 
  | 'swallows'
  | 'hawks'
  | 'marines'
  | 'fighters'
  | 'eagles'
  | 'buffaloes'
  | 'lions';

export type League = 'central' | 'pacific';

export interface Team {
  id: TeamId;
  name: string;
  shortName: string;
  color: string;
  league: League;
  logo?: string;
}

export interface Game {
  id: string;
  date: string;
  time: string;
  homeTeam: TeamId;
  awayTeam: TeamId;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'live' | 'finished' | 'postponed';
  stadium: string;
  attendance?: number;
  detailUrl?: string;
}

export interface InningScore {
  inning: number;
  away: number | string;
  home: number | string;
}

export interface PitcherStats {
  name: string;
  team: TeamId;
  result: 'win' | 'loss' | 'save' | 'hold' | null;
  innings: string;
  hits: number;
  runs: number;
  earnedRuns: number;
  walks: number;
  strikeouts: number;
}

export interface HomeRun {
  inning: number;
  player: string;
  team: TeamId;
  runners: number;
}

export interface GameDetail extends Game {
  inningScores?: InningScore[];
  pitchers?: PitcherStats[];
  homeRuns?: HomeRun[];
  duration?: string | null;
}

export interface Standing {
  rank: number;
  team: TeamId;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  gamesBehind: number;
}

export interface CalendarDay {
  date: Date | null;
  day: number;
  isCurrentMonth: boolean;
}

export interface FilterSettings {
  selectedTeam: TeamId | 'all';
  selectedYear: number;
  selectedMonth: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  favoriteTeam: TeamId | null;
  autoUpdate: boolean;
}

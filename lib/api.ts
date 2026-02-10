import { Game, TeamId } from '@/types';

interface MatchData {
  away: string;
  awayTeamId: string;
  awayScore: number;
  home: string;
  homeTeamId: string;
  homeScore: number;
  url: string;
}

interface GameData {
  date: string;
  matches: MatchData[];
}

export interface NPBGameData {
  year: number;
  month: number;
  games: GameData[];
  scrapedAt: string;
  cacheStatus?: string;
  cacheRemaining?: number;
  responseTime?: number;
  timestamp?: string;
}

export async function fetchGamesData(year: number, month: number): Promise<Game[]> {
  try {
    const response = await fetch(`/api/games?year=${year}&month=${month}`, {
      next: { revalidate: 180 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch games data');
    }

    const data: NPBGameData = await response.json();
    
    const convertedGames: Game[] = [];

    data.games.forEach((dayData) => {
      const dateMatch = dayData.date.match(/(\d+)年(\d+)月(\d+)日/);
      if (!dateMatch) return;

      const gameYear = parseInt(dateMatch[1]);
      const gameMonth = parseInt(dateMatch[2]);
      const gameDay = parseInt(dateMatch[3]);
      const formattedDate = `${gameYear}-${String(gameMonth).padStart(2, '0')}-${String(gameDay).padStart(2, '0')}`;

      dayData.matches.forEach((match, index) => {
        convertedGames.push({
          id: `g${gameYear}${String(gameMonth).padStart(2, '0')}${String(gameDay).padStart(2, '0')}-${String(index + 1).padStart(3, '0')}`,
          date: formattedDate,
          time: '18:00',
          homeTeam: match.homeTeamId as TeamId,
          awayTeam: match.awayTeamId as TeamId,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          status: 'finished',
          stadium: '未設定',
        });
      });
    });

    return convertedGames;
  } catch (error) {
    console.error('Error in fetchGamesData:', error);
    return [];
  }
}

export async function fetchGamesDataClient(year: number, month: number): Promise<NPBGameData> {
  const response = await fetch(`/api/games?year=${year}&month=${month}`);
  if (!response.ok) {
    throw new Error('Failed to fetch games data');
  }
  return response.json();
}

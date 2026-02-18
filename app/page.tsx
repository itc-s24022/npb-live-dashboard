'use client';

import { useEffect, useState } from 'react';
import { Game, TeamId } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { filterGamesByTeam } from '@/lib/utils';
import TeamFilter from '@/components/TeamFilter';
import MonthSelector from '@/components/MonthSelector';
import MonthStats from '@/components/MonthStats';
import CalendarGrid from '@/components/CalendarGrid';

interface NPBGameData {
  year: number;
  month: number;
  games: {
    date: string;
    matches: {
      away: string;
      awayTeamId: string;
      awayScore: number;
      home: string;
      homeTeamId: string;
      homeScore: number;
      url: string;
    }[];
  }[];
  scrapedAt: string;
}

export default function Home() {
  const { filter, settings } = useAppStore();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!settings.autoUpdate) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/games?year=${filter.selectedYear}&month=${filter.selectedMonth}`);
        
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }

        const data: NPBGameData = await response.json();
        
        const convertedGames: Game[] = [];

        data.games.forEach((dayData) => {
          let year = data.year || filter.selectedYear;
          let month = data.month || filter.selectedMonth;
          let day = 1;

          const dateMatch1 = dayData.date.match(/(\d+)年(\d+)月(\d+)日/);
          if (dateMatch1) {
            year = parseInt(dateMatch1[1]);
            month = parseInt(dateMatch1[2]);
            day = parseInt(dateMatch1[3]);
          } else {
            const dateMatch2 = dayData.date.match(/(\d+)月(\d+)日/);
            if (dateMatch2) {
              month = parseInt(dateMatch2[1]);
              day = parseInt(dateMatch2[2]);
            } else {
              return;
            }
          }

          const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          dayData.matches.forEach((match, index) => {
            const gameId = `g${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}-${String(index + 1).padStart(3, '0')}`;
            
            convertedGames.push({
              id: gameId,
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
        
        setGames(convertedGames);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter.selectedYear, filter.selectedMonth, settings.autoUpdate]);

  const filteredGames = filterGamesByTeam(games, filter.selectedTeam);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="text-gray-900 dark:text-white">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-light-card dark:bg-dark-card p-4 border-b border-light-border dark:border-dark-border">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">試合カレンダー</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-red-800 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <MonthSelector />
        <TeamFilter />
      </div>

      <MonthStats games={filteredGames} />
      <CalendarGrid 
        year={filter.selectedYear}
        month={filter.selectedMonth}
        games={filteredGames}
        selectedTeam={filter.selectedTeam}
      />
    </div>
  );
}

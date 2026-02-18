'use client';

import { Game } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { TEAMS } from '@/lib/teams';

interface MonthStatsProps {
  games: Game[];
}

export default function MonthStats({ games }: MonthStatsProps) {
  const { filter } = useAppStore();
  const selectedTeam = filter.selectedTeam;

  const totalGames = games.length;
  
  const teamGames = selectedTeam === 'all' 
    ? totalGames 
    : games.filter(
        game => game.homeTeam === selectedTeam || game.awayTeam === selectedTeam
      ).length;

  const teamName = selectedTeam === 'all' ? '' : TEAMS[selectedTeam]?.shortName || '';

  return (
    <div className="px-4 py-3 bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">今月の試合数</p>
          <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold">
            {totalGames} <span className="text-sm font-normal">試合</span>
          </p>
        </div>

        {selectedTeam !== 'all' && (
          <div className="text-right">
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">{teamName}の試合</p>
            <p className="text-yellow-600 dark:text-yellow-400 text-2xl font-bold">
              {teamGames} <span className="text-sm font-normal">試合</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

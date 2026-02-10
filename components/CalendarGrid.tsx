'use client';

import Link from 'next/link';
import { Game, TeamId } from '@/types';
import { getMonthCalendarDays, formatDate, getGamesByDate, getTeamGameResult } from '@/lib/utils';

interface CalendarGridProps {
  year: number;
  month: number;
  games: Game[];
  selectedTeam: TeamId | 'all';
}

export default function CalendarGrid({ year, month, games, selectedTeam }: CalendarGridProps) {
  const days = getMonthCalendarDays(year, month);
  const today = new Date();
  const todayStr = formatDate(today, 'yyyy-MM-dd');

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="bg-light-card dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border m-4">
      {/* Week Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center text-sm font-bold py-2 ${
              index === 0
                ? 'text-red-500'
                : index === 6
                ? 'text-blue-500'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dateStr = day.date ? formatDate(new Date(day.date), 'yyyy-MM-dd') : '';
          const dayGames = day.date ? getGamesByDate(games, day.date) : [];
          const isToday = dateStr === todayStr;
          const hasGames = dayGames.length > 0;

          return (
            <div key={index} className="aspect-square">
              {day.date ? (
                hasGames ? (
                  <Link
                    href={`/games/${dateStr}`}
                    className={`block w-full h-full rounded-lg border-2 transition-all p-2 ${
                      isToday
                        ? 'bg-primary-green/20 border-primary-green'
                        : 'bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border hover:border-primary-green'
                    }`}
                  >
                    <div className="h-full flex flex-col items-center justify-center">
                      <span
                        className={`text-base font-bold mb-1 ${
                          isToday
                            ? 'text-primary-green'
                            : day.isCurrentMonth
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-400 dark:text-gray-600'
                        }`}
                      >
                        {day.day}
                      </span>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {dayGames.slice(0, 4).map((game, gameIndex) => {
                          const result = selectedTeam === 'all' ? null : getTeamGameResult(game, selectedTeam as TeamId);
                          const dotColor =
                            result === 'win'
                              ? 'bg-primary-green'
                              : result === 'loss'
                              ? 'bg-red-500'
                              : result === 'draw'
                              ? 'bg-gray-400'
                              : 'bg-blue-500';

                          return <div key={gameIndex} className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />;
                        })}
                        {dayGames.length > 4 && (
                          <span className="text-xs text-gray-600 dark:text-gray-400">+{dayGames.length - 4}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div
                    className={`w-full h-full rounded-lg border-2 flex items-center justify-center ${
                      isToday
                        ? 'bg-primary-green/10 border-primary-green'
                        : 'bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border'
                    }`}
                  >
                    <span
                      className={`text-base font-bold ${
                        isToday
                          ? 'text-primary-green'
                          : day.isCurrentMonth
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-gray-600'
                      }`}
                    >
                      {day.day}
                    </span>
                  </div>
                )
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

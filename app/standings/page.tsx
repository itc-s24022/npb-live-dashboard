'use client';

import { useState } from 'react';
import { MOCK_STANDINGS_CENTRAL_2025, MOCK_STANDINGS_PACIFIC_2025 } from '@/lib/mock/standings';
import { TEAMS } from '@/lib/teams';
import { useAppStore } from '@/store/useAppStore';

type LeagueTab = 'central' | 'pacific';

export default function StandingsPage() {
  const [activeLeague, setActiveLeague] = useState<LeagueTab>('central');
  const { filter, toggleYearSelector } = useAppStore();

  const standings = activeLeague === 'central' 
    ? MOCK_STANDINGS_CENTRAL_2025 
    : MOCK_STANDINGS_PACIFIC_2025;

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">順位表</h1>
        <button
          onClick={toggleYearSelector}
          className="px-4 py-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white hover:border-primary-green transition-colors"
        >
          {filter.selectedYear}年
        </button>
      </div>

      {/* League Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveLeague('central')}
          className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
            activeLeague === 'central'
              ? 'bg-primary-green text-white'
              : 'bg-light-card dark:bg-dark-card text-gray-900 dark:text-white border border-light-border dark:border-dark-border'
          }`}
        >
          セントラル・リーグ
        </button>
        <button
          onClick={() => setActiveLeague('pacific')}
          className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
            activeLeague === 'pacific'
              ? 'bg-primary-green text-white'
              : 'bg-light-card dark:bg-dark-card text-gray-900 dark:text-white border border-light-border dark:border-dark-border'
          }`}
        >
          パシフィック・リーグ
        </button>
      </div>

      {/* Standings Table */}
      <div className="bg-light-card dark:bg-dark-card rounded-lg overflow-hidden border border-light-border dark:border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light-bg dark:bg-dark-bg">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">順位</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">チーム</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 dark:text-white">試合</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 dark:text-white">勝</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 dark:text-white">敗</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 dark:text-white">分</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 dark:text-white">勝率</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 dark:text-white">GB</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing) => {
                const team = TEAMS[standing.team];
                const isFirst = standing.rank === 1;

                return (
                  <tr
                    key={standing.team}
                    className={`border-t border-light-border dark:border-dark-border ${
                      isFirst ? 'bg-primary-green/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`text-lg font-bold ${
                          isFirst
                            ? 'text-primary-green'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {standing.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.shortName}
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium">{team.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{standing.games}</td>
                    <td className="px-4 py-3 text-center text-gray-900 dark:text-white font-bold">{standing.wins}</td>
                    <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{standing.losses}</td>
                    <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{standing.draws}</td>
                    <td className="px-4 py-3 text-center text-gray-900 dark:text-white font-bold">
                      {standing.winRate.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                      {standing.gamesBehind === 0 ? '-' : standing.gamesBehind.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        ※ GB = ゲーム差（Games Behind）
      </div>
    </div>
  );
}

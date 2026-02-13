'use client';

import { useState, useEffect } from 'react';
import { TEAMS } from '@/lib/teams';
import { useAppStore } from '@/store/useAppStore';
import MonthSelector from '@/components/MonthSelector';

type LeagueTab = 'central' | 'pacific';

interface Standing {
  rank: number;
  team: string;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  gamesBehind: number;
}

interface StandingsData {
  central: Standing[];
  pacific: Standing[];
}

export default function StandingsPage() {
  const [activeLeague, setActiveLeague] = useState<LeagueTab>('central');
  const [standingsData, setStandingsData] = useState<StandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { filter } = useAppStore();

  useEffect(() => {
    async function fetchStandings() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/standings?year=${filter.selectedYear}&month=${filter.selectedMonth}`
        );
        if (response.ok) {
          const data = await response.json();
          setStandingsData(data);
        }
      } catch (error) {
        console.error('順位表の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStandings();
  }, [filter.selectedYear, filter.selectedMonth]);

  const standings = standingsData 
    ? (activeLeague === 'central' ? standingsData.central : standingsData.pacific)
    : [];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">順位表</h1>
        <MonthSelector />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">順位表</h1>

      {/* Month Selector */}
      <MonthSelector />

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
              {standings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                    この月の試合データがありません
                  </td>
                </tr>
              ) : (
                standings.map((standing) => {
                  const team = TEAMS[standing.team as keyof typeof TEAMS];
                  if (!team) return null;
                  
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>※ GB = ゲーム差（Games Behind）</p>
        <p className="mt-2">※ 月別の成績を表示しています</p>
        <p className="mt-1">※ データ出典: NPB公式サイト</p>
      </div>
    </div>
  );
}

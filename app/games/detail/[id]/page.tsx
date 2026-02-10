'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { TEAMS } from '@/lib/teams';
import { MOCK_GAME_DETAIL_20250601 } from '@/lib/mock/gameDetails';
import { GameDetail, TeamId } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GameDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [gameId, setGameId] = useState<string>('');
  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useRealData, setUseRealData] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      setGameId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!gameId) return;

    const fetchGameDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        if (useRealData) {
          const detailUrl = `https://npb.jp/bis/2025/games/s${gameId}.html`;
          const response = await fetch(`/api/game-detail?url=${encodeURIComponent(detailUrl)}`);
          
          if (!response.ok) {
            throw new Error('データの取得に失敗しました');
          }

          const data = await response.json();
          
          setGame({
            id: gameId,
            date: data.date,
            time: data.time,
            homeTeam: 'baystars' as TeamId,
            awayTeam: 'swallows' as TeamId,
            homeScore: data.homeScore,
            awayScore: data.awayScore,
            status: data.status,
            stadium: data.stadium,
            attendance: data.attendance,
            inningScores: data.inningScores,
            duration: data.duration,
          });
        } else {
          setGame(MOCK_GAME_DETAIL_20250601);
        }
      } catch (err) {
        console.error('Error fetching game detail:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
        setGame(MOCK_GAME_DETAIL_20250601);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetail();
  }, [gameId, useRealData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-gray-900 dark:text-white">読み込み中...</div>
      </div>
    );
  }

  if (error && !game) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-gray-900 dark:text-white">試合情報が見つかりません</div>
      </div>
    );
  }

  const homeTeam = TEAMS[game.homeTeam];
  const awayTeam = TEAMS[game.awayTeam];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pb-20">
      {/* Header */}
      <div className="bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-900 dark:text-white hover:text-primary-green transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>戻る</span>
          </button>
          <button
            onClick={() => setUseRealData(!useRealData)}
            className={`px-3 py-1 rounded text-sm ${
              useRealData
                ? 'bg-primary-green text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          >
            {useRealData ? 'リアルデータ' : 'モックデータ'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Game Info Card */}
        <div className="bg-light-card dark:bg-dark-card rounded-lg p-6 border border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {game.date} {game.time}開始
            </span>
            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded text-sm">
              {game.status}
            </span>
          </div>

          {/* Score */}
          <div className="flex items-center justify-between mb-6">
            {/* Away Team */}
            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: awayTeam.color }}
              >
                {awayTeam.shortName}
              </div>
              <div>
                <div className="text-gray-900 dark:text-white font-bold">{awayTeam.name}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{game.awayScore}</div>
              </div>
            </div>

            <div className="text-gray-600 dark:text-gray-400 text-2xl mx-4">-</div>

            {/* Home Team */}
            <div className="flex items-center gap-3 flex-1 flex-row-reverse">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: homeTeam.color }}
              >
                {homeTeam.shortName}
              </div>
              <div className="text-right">
                <div className="text-gray-900 dark:text-white font-bold">{homeTeam.name}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{game.homeScore}</div>
              </div>
            </div>
          </div>

          {/* Stadium & Attendance */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 border-t border-light-border dark:border-dark-border pt-4">
            <span>{game.stadium}</span>
            {game.attendance && <span>観客数: {game.attendance.toLocaleString()}人</span>}
            {game.duration && <span>試合時間: {game.duration}</span>}
          </div>
        </div>

        {/* Inning Scores */}
        {game.inningScores && game.inningScores.length > 0 && (
          <div className="bg-light-card dark:bg-dark-card rounded-lg p-6 border border-light-border dark:border-dark-border">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">イニング別スコア</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-light-border dark:border-dark-border">
                    <th className="text-left py-2 text-gray-900 dark:text-white">チーム</th>
                    {game.inningScores.map((_, index) => (
                      <th key={index} className="text-center py-2 text-gray-900 dark:text-white">
                        {index + 1}
                      </th>
                    ))}
                    <th className="text-center py-2 text-gray-900 dark:text-white">計</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-light-border dark:border-dark-border">
                    <td className="py-2 text-gray-900 dark:text-white">{awayTeam.shortName}</td>
                    {game.inningScores.map((score, index) => (
                      <td key={index} className="text-center py-2 text-gray-900 dark:text-white">
                        {score.away}
                      </td>
                    ))}
                    <td className="text-center py-2 font-bold text-gray-900 dark:text-white">{game.awayScore}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-900 dark:text-white">{homeTeam.shortName}</td>
                    {game.inningScores.map((score, index) => (
                      <td key={index} className="text-center py-2 text-gray-900 dark:text-white">
                        {score.home}
                      </td>
                    ))}
                    <td className="text-center py-2 font-bold text-gray-900 dark:text-white">{game.homeScore}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Note */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            ℹ️ 個人選手のスコアは表示していません。チーム単位のデータのみを表示しています。
          </p>
        </div>
      </div>
    </div>
  );
}

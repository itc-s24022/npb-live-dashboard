'use client';

import React from 'react';
import Link from 'next/link';

interface GameDetailData {
  gameId: string;
  date: string;
  stadium: string;
  attendance: number;
  time: string;
  endTime: string;
  duration: string;
  inningScores: {
    away: number[];
    home: number[];
  };
  homeScore: number;
  awayScore: number;
  homeTeam: string;
  awayTeam: string;
  runs: {
    away: number;
    home: number;
  };
  hits: {
    away: number;
    home: number;
  };
  errors: {
    away: number;
    home: number;
  };
  status: string;
  winningPitcher?: string;
  losingPitcher?: string;
  savePitcher?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GameDetailPage({ params }: PageProps) {
  const { id } = React.use(params);
  
  const [gameData, setGameData] = React.useState<GameDetailData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchGameDetail() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/game-detail?gameId=${id}`);
        
        if (!response.ok) {
          throw new Error('データ取得に失敗しました');
        }
        
        const data = await response.json();
        console.log('取得したゲーム詳細:', data);
        setGameData(data);
      } catch (err) {
        console.error('エラー:', err);
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchGameDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1d29] flex items-center justify-center">
        <div className="text-white">読み込み中...</div>
      </div>
    );
  }

  if (error || !gameData) {
    return (
      <div className="min-h-screen bg-[#1a1d29] flex items-center justify-center">
        <div className="text-white">エラーが発生しました</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d29] text-white">
      {/* ヘッダー */}
      <div className="bg-[#252935] px-4 py-3 flex items-center">
        <Link href="/games" className="text-blue-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="ml-3">
          <h1 className="text-lg font-semibold">試合詳細</h1>
          <p className="text-xs text-gray-400">{gameData.date}</p>
        </div>
      </div>

      {/* 試合ステータス */}
      <div className="bg-[#1e4d3d] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          <span className="text-sm text-green-400">{gameData.status}</span>
        </div>
        <span className="text-xs text-gray-300">試合時間 {gameData.duration} {gameData.time}〜{gameData.endTime}</span>
      </div>

      {/* スコア表示 */}
      <div className="px-4 py-6">
        {/* ビジターチーム */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
              De
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">{gameData.awayTeam}</div>
              <div className="text-xs text-gray-400">ベイスターズ</div>
            </div>
            <div className="text-4xl font-bold">{gameData.awayScore}</div>
          </div>
        </div>

        {/* ホームチーム */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
              ヤ
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">{gameData.homeTeam}</div>
              <div className="text-xs text-gray-400">スワローズ</div>
            </div>
            <div className="text-4xl font-bold">{gameData.awayScore > gameData.homeScore ? gameData.homeScore : gameData.homeScore}</div>
          </div>
        </div>

        {/* 球場情報 */}
        <div className="flex items-center text-xs text-gray-400 mb-6">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{gameData.stadium}</span>
          <svg className="w-4 h-4 ml-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>{gameData.attendance.toLocaleString()}人</span>
        </div>

        {/* イニング別スコア */}
        <div className="bg-[#252935] rounded-lg p-4 mb-6">
          <h2 className="text-sm font-semibold mb-3">イニング別スコア</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="pb-2 text-left w-16"></th>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((inning) => (
                    <th key={inning} className="pb-2 text-center w-8">{inning}</th>
                  ))}
                  <th className="pb-2 text-center w-10 bg-blue-900/30">R</th>
                  <th className="pb-2 text-center w-10 bg-green-900/30">H</th>
                  <th className="pb-2 text-center w-10 bg-red-900/30">E</th>
                </tr>
              </thead>
              <tbody>
                {/* ビジター */}
                <tr className="border-b border-gray-700">
                  <td className="py-3 flex items-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                      ヤ
                    </div>
                    <span className="text-xs">ヤクルト</span>
                  </td>
                  {gameData.inningScores.away.slice(0, 9).map((score, idx) => (
                    <td key={idx} className="py-3 text-center">{score}</td>
                  ))}
                  {Array.from({ length: 9 - gameData.inningScores.away.length }).map((_, idx) => (
                    <td key={`empty-away-${idx}`} className="py-3 text-center text-gray-600">0</td>
                  ))}
                  <td className="py-3 text-center font-bold bg-blue-900/30">{gameData.runs.away}</td>
                  <td className="py-3 text-center bg-green-900/30">{gameData.hits.away}</td>
                  <td className="py-3 text-center bg-red-900/30">{gameData.errors.away}</td>
                </tr>
                {/* ホーム */}
                <tr>
                  <td className="py-3 flex items-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                      De
                    </div>
                    <span className="text-xs">DeNA</span>
                  </td>
                  {gameData.inningScores.home.slice(0, 9).map((score, idx) => (
                    <td key={idx} className="py-3 text-center">{score === -1 ? 'X' : score}</td>
                  ))}
                  {Array.from({ length: 9 - gameData.inningScores.home.length }).map((_, idx) => (
                    <td key={`empty-home-${idx}`} className="py-3 text-center text-gray-600">0</td>
                  ))}
                  <td className="py-3 text-center font-bold bg-blue-900/30">{gameData.runs.home}</td>
                  <td className="py-3 text-center bg-green-900/30">{gameData.hits.home}</td>
                  <td className="py-3 text-center bg-red-900/30">{gameData.errors.home}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 投手成績 */}
        {(gameData.winningPitcher || gameData.losingPitcher || gameData.savePitcher) && (
          <div className="bg-[#252935] rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3">投手成績</h2>
            
            {gameData.winningPitcher && (
              <div className="mb-3 flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-xs font-bold mr-3">
                  勝
                </div>
                <div>
                  <div className="text-sm font-medium">{gameData.winningPitcher.split('(')[0].trim()}</div>
                  <div className="text-xs text-gray-400">{gameData.winningPitcher.includes('(') ? gameData.winningPitcher.split('(')[1] : ''}</div>
                </div>
              </div>
            )}

            {gameData.savePitcher && (
              <div className="mb-3 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-xs font-bold mr-3">
                  S
                </div>
                <div>
                  <div className="text-sm font-medium">{gameData.savePitcher.split('(')[0].trim()}</div>
                  <div className="text-xs text-gray-400">{gameData.savePitcher.includes('(') ? gameData.savePitcher.split('(')[1] : ''}</div>
                </div>
              </div>
            )}

            {gameData.losingPitcher && (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-xs font-bold mr-3">
                  敗
                </div>
                <div>
                  <div className="text-sm font-medium">{gameData.losingPitcher.split('(')[0].trim()}</div>
                  <div className="text-xs text-gray-400">{gameData.losingPitcher.includes('(') ? gameData.losingPitcher.split('(')[1] : ''}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

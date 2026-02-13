'use client';

import React from 'react';
import Link from 'next/link';
import { TEAMS } from '@/app/lib/constants';

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
  runs: { away: number; home: number };
  hits: { away: number; home: number };
  errors: { away: number; home: number };
  status: string;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error || !gameData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">エラーが発生しました</div>
      </div>
    );
  }

  // チーム情報を取得（チーム名から推測）
  const getTeamInfo = (teamName: string) => {
    // チーム名から対応するキーを探す
    for (const [key, team] of Object.entries(TEAMS)) {
      if (teamName.includes(team.shortName) || teamName.includes(team.fullName)) {
        return team;
      }
    }
    return null;
  };

  const awayTeamInfo = getTeamInfo(gameData.awayTeam);
  const homeTeamInfo = getTeamInfo(gameData.homeTeam);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">試合詳細</h1>
            <p className="text-xs text-gray-500">{gameData.date}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 試合ステータス */}
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-green-700 font-medium">{gameData.status}</span>
          </div>
          <span className="text-xs text-gray-600">
            試合時間 {gameData.duration} ({gameData.time}〜{gameData.endTime})
          </span>
        </div>

        {/* 球場・観客情報 */}
        <div className="bg-white rounded-lg shadow-sm border p-3 mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{gameData.stadium}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{gameData.attendance.toLocaleString()}人</span>
            </div>
          </div>
        </div>

        {/* スコア表示 */}
        <div className="bg-white rounded-lg shadow-sm border mb-4 overflow-hidden">
          {/* ビジターチーム */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center flex-1">
              {awayTeamInfo ? (
                <>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3"
                    style={{ backgroundColor: awayTeamInfo.primaryColor, color: awayTeamInfo.secondaryColor }}
                  >
                    {awayTeamInfo.icon}
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold">{awayTeamInfo.fullName}</div>
                    <div className="text-xs text-gray-500">{awayTeamInfo.league}</div>
                  </div>
                </>
              ) : (
                <div className="text-gray-900 font-semibold">{gameData.awayTeam}</div>
              )}
            </div>
            <div className="text-4xl font-bold text-gray-900">{gameData.awayScore}</div>
          </div>

          {/* ホームチーム */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center flex-1">
              {homeTeamInfo ? (
                <>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3"
                    style={{ backgroundColor: homeTeamInfo.primaryColor, color: homeTeamInfo.secondaryColor }}
                  >
                    {homeTeamInfo.icon}
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold">{homeTeamInfo.fullName}</div>
                    <div className="text-xs text-gray-500">{homeTeamInfo.league}</div>
                  </div>
                </>
              ) : (
                <div className="text-gray-900 font-semibold">{gameData.homeTeam}</div>
              )}
            </div>
            <div className="text-4xl font-bold text-gray-900">{gameData.homeScore}</div>
          </div>
        </div>

        {/* イニング別スコア */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            イニング別スコア
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="pb-2 text-left pr-3 font-medium w-24"></th>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((inning) => (
                    <th key={inning} className="pb-2 text-center px-2 font-medium w-8">{inning}</th>
                  ))}
                  <th className="pb-2 text-center px-2 font-semibold w-10">R</th>
                  <th className="pb-2 text-center px-2 font-medium w-10">H</th>
                  <th className="pb-2 text-center px-2 font-medium w-10">E</th>
                </tr>
              </thead>
              <tbody>
                {/* ビジター */}
                <tr className="border-b">
                  <td className="py-3 pr-3">
                    <div className="flex items-center whitespace-nowrap">
                      {awayTeamInfo && (
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2"
                          style={{ backgroundColor: awayTeamInfo.primaryColor, color: awayTeamInfo.secondaryColor }}
                        >
                          {awayTeamInfo.icon}
                        </div>
                      )}
                      <span className="text-sm text-gray-700">
                        {awayTeamInfo ? awayTeamInfo.shortName : gameData.awayTeam}
                      </span>
                    </div>
                  </td>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
                    const score = gameData.inningScores.away[idx];
                    return (
                      <td key={idx} className="py-3 text-center px-2 text-gray-700">
                        {score !== undefined ? score : '0'}
                      </td>
                    );
                  })}
                  <td className="py-3 text-center px-2 font-bold text-gray-900">{gameData.runs.away}</td>
                  <td className="py-3 text-center px-2 text-gray-700">{gameData.hits.away}</td>
                  <td className="py-3 text-center px-2 text-gray-700">{gameData.errors.away}</td>
                </tr>
                {/* ホーム */}
                <tr>
                  <td className="py-3 pr-3">
                    <div className="flex items-center whitespace-nowrap">
                      {homeTeamInfo && (
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2"
                          style={{ backgroundColor: homeTeamInfo.primaryColor, color: homeTeamInfo.secondaryColor }}
                        >
                          {homeTeamInfo.icon}
                        </div>
                      )}
                      <span className="text-sm text-gray-700">
                        {homeTeamInfo ? homeTeamInfo.shortName : gameData.homeTeam}
                      </span>
                    </div>
                  </td>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
                    const score = gameData.inningScores.home[idx];
                    return (
                      <td key={idx} className="py-3 text-center px-2 text-gray-700">
                        {score !== undefined ? score : (idx === 8 ? 'X' : '0')}
                      </td>
                    );
                  })}
                  <td className="py-3 text-center px-2 font-bold text-gray-900">{gameData.runs.home}</td>
                  <td className="py-3 text-center px-2 text-gray-700">{gameData.hits.home}</td>
                  <td className="py-3 text-center px-2 text-gray-700">{gameData.errors.home}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

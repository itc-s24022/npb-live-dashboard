'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { TEAMS } from '@/lib/teams';
import { Game, TeamId } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { filterGamesByTeam } from '@/lib/utils';
import TeamFilter from '@/components/TeamFilter';

interface PageProps {
  params: Promise<{ date: string }>;
}

export default function GamesListPage({ params }: PageProps) {
  const { date } = React.use(params);
  const { filter } = useAppStore();

  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGames() {
      try {
        setLoading(true);
        setError(null);

        const [year, month] = date.split('-');
        const response = await fetch(`/api/games?year=${year}&month=${parseInt(month)}`);
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }

        const data = await response.json();
        const games: Game[] = [];

        if (data.games) {
          data.games.forEach((dayData: { date: string; matches: { away: string; awayTeamId: string; awayScore: number; home: string; homeTeamId: string; homeScore: number; url: string; detailUrl?: string; status?: string }[] }) => {
            let gameYear = parseInt(year);
            let gameMonth = parseInt(month);
            let day = 1;

            const dateMatch1 = dayData.date.match(/(\d+)年(\d+)月(\d+)日/);
            if (dateMatch1) {
              gameYear = parseInt(dateMatch1[1]);
              gameMonth = parseInt(dateMatch1[2]);
              day = parseInt(dateMatch1[3]);
            } else {
              const dateMatch2 = dayData.date.match(/(\d+)月(\d+)日/);
              if (dateMatch2) {
                gameMonth = parseInt(dateMatch2[1]);
                day = parseInt(dateMatch2[2]);
              }
            }

            const formattedDate = `${gameYear}-${String(gameMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // この日付の試合だけ対象にする
            if (formattedDate !== date) return;

            dayData.matches.forEach((match, index) => {
              // NPB公式の実際のゲームIDをURLから抽出する
              // url例: "https://npb.jp/bis/2025/games/s2025040100115.html"
              let gameId = `g${gameYear}${String(gameMonth).padStart(2, '0')}${String(day).padStart(2, '0')}-${String(index + 1).padStart(3, '0')}`;
              const detailUrl = match.detailUrl || match.url || '';
              const idMatch = detailUrl.match(/(s\d+)\.html/);
              if (idMatch) {
                gameId = idMatch[1];
              }

              let gameStatus: 'scheduled' | 'live' | 'finished' | 'postponed' = 'finished';
              if (match.status === 'postponed' || match.status === '中止') {
                gameStatus = 'postponed';
              }

              games.push({
                id: gameId,
                date: formattedDate,
                time: '18:00',
                homeTeam: match.homeTeamId as TeamId,
                awayTeam: match.awayTeamId as TeamId,
                homeScore: match.homeScore,
                awayScore: match.awayScore,
                status: gameStatus,
                stadium: '未設定',
              });
            });
          });
        }

        setAllGames(games);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, [date]);

  // フィルターを適用
  const games = filterGamesByTeam(allGames, filter.selectedTeam);

  // 日付をフォーマット
  const dateObj = new Date(date + 'T00:00:00');
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const formattedDate = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日（${weekDays[dateObj.getDay()]}）`;

  // リーグ別にグループ化
  const centralGames = games.filter(
    (game) =>
      TEAMS[game.homeTeam]?.league === 'central' &&
      TEAMS[game.awayTeam]?.league === 'central'
  );
  const pacificGames = games.filter(
    (game) =>
      TEAMS[game.homeTeam]?.league === 'pacific' &&
      TEAMS[game.awayTeam]?.league === 'pacific'
  );
  const interleagueGames = games.filter(
    (game) =>
      TEAMS[game.homeTeam] &&
      TEAMS[game.awayTeam] &&
      TEAMS[game.homeTeam].league !== TEAMS[game.awayTeam].league
  );

  const getStatusBadge = (game: Game) => {
    switch (game.status) {
      case 'postponed':
        return (
          <span className="px-2 py-1 bg-red-200 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-xs">
            中止
          </span>
        );
      case 'scheduled':
        return (
          <span className="px-2 py-1 bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
            予定
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
            試合終了
          </span>
        );
    }
  };

  const GameCard = ({ game }: { game: Game }) => {
    const homeTeam = TEAMS[game.homeTeam];
    const awayTeam = TEAMS[game.awayTeam];

    if (!homeTeam || !awayTeam) return null;

    const isPostponed = game.status === 'postponed';

    const cardContent = (
      <div className="bg-light-card dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border hover:border-primary-green transition-colors">
        <div className="flex items-center justify-between">
          {/* Away Team */}
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: awayTeam.color }}
            >
              {awayTeam.shortName}
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">ビジター</div>
              <div className="font-bold text-gray-900 dark:text-white">{awayTeam.name}</div>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-4 mx-4">
            {isPostponed ? (
              <div className="text-xl font-bold text-red-500">中止</div>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{game.awayScore}</div>
                <div className="text-2xl text-gray-400">-</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{game.homeScore}</div>
              </>
            )}
          </div>

          {/* Home Team */}
          <div className="flex items-center gap-3 flex-1 flex-row-reverse">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: homeTeam.color }}
            >
              {homeTeam.shortName}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">ホーム</div>
              <div className="font-bold text-gray-900 dark:text-white">{homeTeam.name}</div>
            </div>
          </div>
        </div>

        {/* Game Info */}
        <div className="mt-3 pt-3 border-t border-light-border dark:border-dark-border flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{game.stadium}</span>
          <div className="flex items-center gap-3">
            {getStatusBadge(game)}
          </div>
        </div>
      </div>
    );

    if (isPostponed) {
      return <div className="block">{cardContent}</div>;
    }

    return (
      <Link href={`/games/detail/${game.id}`} className="block">
        {cardContent}
      </Link>
    );
  };

  const LeagueSection = ({ title, leagueGames }: { title: string; leagueGames: Game[] }) => {
    if (leagueGames.length === 0) return null;
    return (
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <div className="space-y-3">
          {leagueGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-900 dark:text-white hover:text-primary-green transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>戻る</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{formattedDate}の試合</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* チームフィルター */}
      <div className="bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border px-4 pb-4">
        <TeamFilter />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 試合数 */}
        <div className="text-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{games.length}</span>
          <span className="text-gray-600 dark:text-gray-400 ml-2">試合</span>
          {filter.selectedTeam !== 'all' && allGames.length !== games.length && (
            <span className="text-gray-500 dark:text-gray-500 ml-2 text-sm">
              （全{allGames.length}試合中）
            </span>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-red-800 dark:text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {games.length === 0 && !error && (
          <div className="text-center text-gray-600 dark:text-gray-400 py-8">
            {filter.selectedTeam !== 'all'
              ? '選択したチームの試合はありません'
              : 'この日の試合データがありません'}
          </div>
        )}

        <LeagueSection title="セントラル・リーグ" leagueGames={centralGames} />
        <LeagueSection title="パシフィック・リーグ" leagueGames={pacificGames} />
        <LeagueSection title="交流戦" leagueGames={interleagueGames} />

        {/* Data Source */}
        {games.length > 0 && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4">
            ※ データ出典: NPB公式サイト
          </div>
        )}
      </div>
    </div>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { MOCK_GAMES_2025_06 } from '@/lib/mock/games';
import { TEAMS } from '@/lib/teams';
import { Game } from '@/types';

interface PageProps {
  params: Promise<{ date: string }>;
}

export default async function GamesListPage({ params }: PageProps) {
  const { date } = await params;
  
  // 日付文字列でフィルタリング
  const games = MOCK_GAMES_2025_06.filter(game => game.date === date);

  if (games.length === 0) {
    notFound();
  }

  // リーグ別にグループ化
  const centralGames = games.filter(
    (game) => TEAMS[game.homeTeam].league === 'central' && TEAMS[game.awayTeam].league === 'central'
  );
  const pacificGames = games.filter(
    (game) => TEAMS[game.homeTeam].league === 'pacific' && TEAMS[game.awayTeam].league === 'pacific'
  );

  // 日付をフォーマット
  const dateObj = new Date(date);
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const formattedDate = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日（${weekDays[dateObj.getDay()]}）`;

  const GameCard = ({ game }: { game: Game }) => {
    const homeTeam = TEAMS[game.homeTeam];
    const awayTeam = TEAMS[game.awayTeam];

    return (
      <Link
        href={`/games/detail/${game.id}`}
        className="block bg-light-card dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border hover:border-primary-green transition-colors"
      >
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
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{game.awayScore}</div>
            <div className="text-2xl text-gray-400">-</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{game.homeScore}</div>
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
            <span>{game.time}開始</span>
            <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              {game.status === 'finished' ? '試合終了' : game.status}
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pb-20">
      {/* Header */}
      <div className="bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-900 dark:text-white hover:text-primary-green transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>戻る</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{formattedDate}の試合</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 試合数 */}
        <div className="text-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{games.length}</span>
          <span className="text-gray-600 dark:text-gray-400 ml-2">試合</span>
        </div>

        {/* Central League Games */}
        {centralGames.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">セントラル・リーグ</h2>
            <div className="space-y-3">
              {centralGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {/* Pacific League Games */}
        {pacificGames.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">パシフィック・リーグ</h2>
            <div className="space-y-3">
              {pacificGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

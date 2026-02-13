import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { TEAMS } from '@/lib/teams';
import { Game, TeamId } from '@/types';

interface PageProps {
  params: Promise<{ date: string }>;
}

interface MatchData {
  away: string;
  awayTeamId: string;
  awayScore: number;
  homeScore: number;
  home: string;
  homeTeamId: string;
  url: string;
  detailUrl?: string;
}

interface GameData {
  date: string;
  matches: MatchData[];
}

async function fetchGamesForDate(date: string): Promise<Game[]> {
  try {
    // 日付から年月を抽出
    const [year, month] = date.split('-');
    
    // カレンダーAPIからデータを取得
    const response = await fetch(
      `http://localhost:3000/api/games?year=${year}&month=${parseInt(month)}`,
      { next: { revalidate: 86400 } } // 24時間キャッシュ
    );

    if (!response.ok) {
      throw new Error('Failed to fetch games data');
    }

    const data = await response.json();
    
    // 指定された日付の試合を探す
    const targetDate = new Date(date);
    const targetDay = targetDate.getDate();
    const targetMonth = targetDate.getMonth() + 1;

    const dayGames = data.games.find((g: GameData) => {
      const match = g.date.match(/(\d+)月(\d+)日/);
      if (match) {
        const gameMonth = parseInt(match[1]);
        const gameDay = parseInt(match[2]);
        return gameMonth === targetMonth && gameDay === targetDay;
      }
      return false;
    });

    if (!dayGames || !dayGames.matches) {
      return [];
    }

    // Game型に変換
    const games: Game[] = dayGames.matches.map((match: MatchData, index: number) => ({
      id: match.url.split('/').pop()?.replace('.html', '') || `${date}-${index}`,
      date: date,
      time: '18:00',
      homeTeam: match.homeTeamId as TeamId,
      awayTeam: match.awayTeamId as TeamId,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      status: 'finished' as const,
      stadium: '未設定',
      detailUrl: match.detailUrl,
    }));

    return games;
  } catch (error) {
    console.error('Error fetching games for date:', error);
    return [];
  }
}

export default async function GamesListPage({ params }: PageProps) {
  const { date } = await params;
  
  const games = await fetchGamesForDate(date);

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
  const interleagueGames = games.filter(
    (game) => TEAMS[game.homeTeam].league !== TEAMS[game.awayTeam].league
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
              試合終了
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

        {/* Interleague Games */}
        {interleagueGames.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">交流戦</h2>
            <div className="space-y-3">
              {interleagueGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {/* Data Source */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4">
          ※ データ出典: NPB公式サイト
        </div>
      </div>
    </div>
  );
}

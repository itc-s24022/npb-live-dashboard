import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { TEAMS } from '@/lib/teams';
import { Game, TeamId } from '@/types';
import * as cheerio from 'cheerio';

interface PageProps {
  params: Promise<{ date: string }>;
}

// チーム名マッピング（NPB公式の表記 → TeamId）
const TEAM_NAME_MAP: Record<string, string> = {
  '読　売': 'giants',
  '読売': 'giants',
  '阪　神': 'hanshin',
  '阪神': 'hanshin',
  '中　日': 'dragons',
  '中日': 'dragons',
  '広島東洋': 'carp',
  '広島': 'carp',
  '横浜DeNA': 'baystars',
  'ＤｅＮＡ': 'baystars',
  'DeNA': 'baystars',
  '東京ヤクルト': 'swallows',
  'ヤクルト': 'swallows',
  '福岡ソフトバンク': 'hawks',
  'ソフトバンク': 'hawks',
  '埼玉西武': 'lions',
  '西武': 'lions',
  '東北楽天': 'eagles',
  '楽天': 'eagles',
  '千葉ロッテ': 'marines',
  'ロッテ': 'marines',
  '北海道日本ハム': 'fighters',
  '日本ハム': 'fighters',
  'オリックス': 'buffaloes',
};

function getTeamId(teamName: string): string {
  const trimmed = teamName.trim();
  if (TEAM_NAME_MAP[trimmed]) return TEAM_NAME_MAP[trimmed];
  for (const [key, value] of Object.entries(TEAM_NAME_MAP)) {
    if (trimmed.includes(key) || key.includes(trimmed)) {
      return value;
    }
  }
  return 'unknown';
}

async function fetchGamesForDate(date: string): Promise<Game[]> {
  try {
    const [year, month, day] = date.split('-');
    const dateStr = `${year}${month}${day}`;

    const url = `https://npb.jp/bis/${year}/games/gm${dateStr}.html`;
    console.log(`[GAMES PAGE] Fetching: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      console.log(`[GAMES PAGE] HTTP ${response.status} for ${url}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const games: Game[] = [];

    // NPBサマリーページの構造:
    // table > table（リーグごと）> tr（試合ごとに2行ペア）
    // 1行目: [img, awayTeam, awayScore, -, homeScore, homeTeam, img]
    // 2行目: [statusLink(colspan=2), stadium(colspan=3)]
    $('table table').each((_tableIdx, table) => {
      const rows = $(table).find('tr');

      for (let i = 0; i < rows.length; i += 2) {
        const scoreRow = $(rows[i]);
        const infoRow = $(rows[i + 1]);

        if (!infoRow || infoRow.length === 0) continue;

        const scoreCells = scoreRow.find('td');
        const infoCells = infoRow.find('td');

        if (scoreCells.length < 5) continue;

        // スコア行からチーム名・スコアを取得
        const awayTeamName = $(scoreCells[1]).text().trim();
        const awayScoreText = $(scoreCells[2]).text().trim();
        const homeScoreText = $(scoreCells[4]).text().trim();
        const homeTeamName = $(scoreCells[5]).text().trim();

        const awayScore = awayScoreText ? parseInt(awayScoreText) : 0;
        const homeScore = homeScoreText ? parseInt(homeScoreText) : 0;

        // 情報行からステータスとスタジアムを取得
        let statusText = '';
        let stadium = '';
        let gameId = '';

        const infoLink = infoCells.find('a').first();
        if (infoLink.length > 0) {
          statusText = infoLink.text().trim();
          const href = infoLink.attr('href') || '';
          const idMatch = href.match(/(s\d+)\.html/);
          if (idMatch) {
            gameId = idMatch[1];
          }
        }

        // 球場名: 最後のtdから取得
        if (infoCells.length >= 2) {
          stadium = $(infoCells[infoCells.length - 1]).text().trim();
        }

        // ステータス判定
        let gameStatus: 'scheduled' | 'live' | 'finished' | 'postponed' = 'finished';
        if (statusText === '中止') {
          gameStatus = 'postponed';
        } else if (isNaN(awayScore) && isNaN(homeScore)) {
          gameStatus = 'scheduled';
        }

        const awayTeamId = getTeamId(awayTeamName);
        const homeTeamId = getTeamId(homeTeamName);

        if (awayTeamName && homeTeamName && awayTeamId !== 'unknown' && homeTeamId !== 'unknown') {
          games.push({
            id: gameId || `${date}-${games.length}`,
            date,
            time: '18:00',
            homeTeam: homeTeamId as TeamId,
            awayTeam: awayTeamId as TeamId,
            homeScore: isNaN(homeScore) ? 0 : homeScore,
            awayScore: isNaN(awayScore) ? 0 : awayScore,
            status: gameStatus,
            stadium: stadium || '未設定',
          });
        }
      }
    });

    console.log(`[GAMES PAGE] Found ${games.length} games for ${date}`);
    return games;
  } catch (error) {
    console.error('[GAMES PAGE] Error:', error);
    return [];
  }
}

export default async function GamesListPage({ params }: PageProps) {
  const { date } = await params;

  const games = await fetchGamesForDate(date);

  if (games.length === 0) {
    notFound();
  }

  // リーグ別にグループ化（TEAMSに存在しないチームも安全に処理）
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

  // 日付をフォーマット
  const dateObj = new Date(date);
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const formattedDate = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日（${weekDays[dateObj.getDay()]}）`;

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
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
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
          <div className="w-16" />
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

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const CACHE_DURATION = 86400; // 24時間
const SCRAPING_DELAY = 1000; // 1秒

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// サーバーサイドのメモリキャッシュ
const memoryCache = new Map<string, { data: unknown; timestamp: number }>();

const TEAM_NAME_MAP: Record<string, string> = {
  '巨': 'giants',
  '巨人': 'giants',
  '読売': 'giants',
  '神': 'hanshin',
  '阪': 'hanshin',
  '阪神': 'hanshin',
  '中': 'dragons',
  '中日': 'dragons',
  '広': 'carp',
  '広島': 'carp',
  'Ｄ': 'baystars',
  'De': 'baystars',
  'デ': 'baystars',
  'DeNA': 'baystars',
  'ヤ': 'swallows',
  'ヤクルト': 'swallows',
  'ソ': 'hawks',
  'ソフトバンク': 'hawks',
  '西': 'lions',
  '西武': 'lions',
  '楽': 'eagles',
  '楽天': 'eagles',
  'ロ': 'marines',
  'ロッテ': 'marines',
  '日': 'fighters',
  '日本ハム': 'fighters',
  'オ': 'buffaloes',
  'オリックス': 'buffaloes',
};

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

function getTeamId(teamName: string): string {
  for (const [key, value] of Object.entries(TEAM_NAME_MAP)) {
    if (teamName.includes(key)) {
      return value;
    }
  }
  return 'unknown';
}

async function scrapeMonthlyStandings(year: string, month: string): Promise<StandingsData> {
  console.log(`[SCRAPING] NPB月別順位表をスクレイピング: ${year}年${month}月`);

  const url = `https://npb.jp/bis/${year}/calendar/index_${month.padStart(2, '0')}.html`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'NPB-Live-Dashboard/1.0 (Educational Purpose)',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    
    const teamStats: Record<string, { wins: number; losses: number; draws: number }> = {};

    $('table td[nowrap="nowrap"]').each((_index, element) => {
      const $td = $(element);
      
      $td.find('a').each((_i, link) => {
        const $link = $(link);
        const text = $link.text().trim();
        
        const scoreMatch = text.match(/^(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+?)$/);
        if (scoreMatch) {
          const awayTeamName = scoreMatch[1].trim();
          const awayScore = parseInt(scoreMatch[2]);
          const homeScore = parseInt(scoreMatch[3]);
          const homeTeamName = scoreMatch[4].trim();
          
          const awayTeamId = getTeamId(awayTeamName);
          const homeTeamId = getTeamId(homeTeamName);
          
          if (awayTeamId === 'unknown' || homeTeamId === 'unknown') return;
          
          if (!teamStats[awayTeamId]) {
            teamStats[awayTeamId] = { wins: 0, losses: 0, draws: 0 };
          }
          if (!teamStats[homeTeamId]) {
            teamStats[homeTeamId] = { wins: 0, losses: 0, draws: 0 };
          }
          
          if (awayScore > homeScore) {
            teamStats[awayTeamId].wins++;
            teamStats[homeTeamId].losses++;
          } else if (homeScore > awayScore) {
            teamStats[homeTeamId].wins++;
            teamStats[awayTeamId].losses++;
          } else {
            teamStats[awayTeamId].draws++;
            teamStats[homeTeamId].draws++;
          }
        }
      });
    });

    const centralTeams = ['giants', 'hanshin', 'dragons', 'baystars', 'carp', 'swallows'];
    const pacificTeams = ['hawks', 'lions', 'eagles', 'marines', 'fighters', 'buffaloes'];

    const createStandings = (teams: string[]): Standing[] => {
      const standings = teams
        .map(teamId => {
          const stats = teamStats[teamId] || { wins: 0, losses: 0, draws: 0 };
          const games = stats.wins + stats.losses + stats.draws;
          const winRate = (stats.wins + stats.losses) > 0 ? stats.wins / (stats.wins + stats.losses) : 0;
          
          return {
            rank: 0,
            team: teamId,
            games,
            wins: stats.wins,
            losses: stats.losses,
            draws: stats.draws,
            winRate,
            gamesBehind: 0,
          };
        })
        .filter(standing => standing.games > 0)
        .sort((a, b) => b.winRate - a.winRate);

      // 順位とゲーム差を計算
      const firstWinRate = standings.length > 0 ? standings[0].winRate : 0;
      return standings.map((standing, index) => ({
        ...standing,
        rank: index + 1,
        gamesBehind: index === 0 ? 0 : 
          ((firstWinRate - standing.winRate) * (standing.wins + standing.losses)) / 2,
      }));
    };

    const central = createStandings(centralTeams);
    const pacific = createStandings(pacificTeams);

    console.log(`[SUCCESS] 月別順位表データを取得しました`);
    console.log(`  セ・リーグ: ${central.length}チーム`);
    console.log(`  パ・リーグ: ${pacific.length}チーム`);

    return { central, pacific };
  } catch (error) {
    console.error('[ERROR] 順位表スクレイピング失敗:', error);
    throw new Error('順位表の取得に失敗しました');
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get('year') || '2025';
  const month = searchParams.get('month') || '4';

  const cacheKey = `standings-${year}-${month}`;

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`[REQUEST] ${year}年${month}月の順位表リクエスト`);
  console.log(`[TIME] ${new Date().toISOString()}`);

  // メモリキャッシュの確認
  const cached = memoryCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION * 1000) {
    const responseTime = Date.now() - startTime;
    const cacheAge = Math.floor((Date.now() - cached.timestamp) / 1000);
    const cacheRemaining = CACHE_DURATION - cacheAge;

    console.log(`[CACHE HIT] メモリキャッシュから返却（残り${cacheRemaining}秒）`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    return NextResponse.json(
      {
        year,
        month,
        ...(cached.data as object),
        cacheStatus: 'HIT',
        cacheAge,
        cacheRemaining,
        timestamp: new Date().toISOString(),
        responseTime,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, max-age=${cacheRemaining}, s-maxage=${cacheRemaining}, stale-while-revalidate=${CACHE_DURATION}`,
          'X-Cache-Status': 'HIT',
          'X-Response-Time': `${responseTime}ms`,
        },
      }
    );
  }

  try {
    await delay(SCRAPING_DELAY);

    const data = await scrapeMonthlyStandings(year, month);

    // メモリキャッシュに保存
    memoryCache.set(cacheKey, { data, timestamp: Date.now() });

    const responseTime = Date.now() - startTime;

    console.log(`[SUCCESS] 順位表データ取得完了`);
    console.log(`[CACHE STORE] メモリキャッシュに保存（${CACHE_DURATION}秒）`);
    console.log(`[PERFORMANCE] 総レスポンス時間: ${responseTime}ms`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    return NextResponse.json(
      {
        year,
        month,
        ...data,
        cacheStatus: 'MISS',
        cacheRemaining: CACHE_DURATION,
        timestamp: new Date().toISOString(),
        responseTime,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, max-age=${CACHE_DURATION}, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
          'CDN-Cache-Control': `public, max-age=${CACHE_DURATION}`,
          'Vercel-CDN-Cache-Control': `max-age=${CACHE_DURATION}`,
          'X-Cache-Status': 'MISS',
          'X-Response-Time': `${responseTime}ms`,
        },
      }
    );
  } catch (error) {
    console.error('[ERROR]', error);
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '不明なエラー',
        responseTime,
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;

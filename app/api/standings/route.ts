import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const CACHE_DURATION = 86400; // 24時間
const SCRAPING_DELAY = 1000; // 1秒

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

  // カレンダーページから月間成績を集計
  const url = `https://npb.jp/bis/${year}/calendar/index_${month.padStart(2, '0')}.html`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'NPB-Live-Dashboard/1.0 (Educational Purpose)',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    
    // チーム別の戦績を集計
    const teamStats: Record<string, { wins: number; losses: number; draws: number }> = {};

    // カレンダーから試合結果を抽出
    $('table td[nowrap="nowrap"]').each((index, element) => {
      const $td = $(element);
      
      $td.find('a').each((i, link) => {
        const $link = $(link);
        const text = $link.text().trim();
        
        // スコア形式（例: "巨 5 - 2 中"）
        const scoreMatch = text.match(/^(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+?)$/);
        if (scoreMatch) {
          const awayTeamName = scoreMatch[1].trim();
          const awayScore = parseInt(scoreMatch[2]);
          const homeScore = parseInt(scoreMatch[3]);
          const homeTeamName = scoreMatch[4].trim();
          
          const awayTeamId = getTeamId(awayTeamName);
          const homeTeamId = getTeamId(homeTeamName);
          
          if (awayTeamId === 'unknown' || homeTeamId === 'unknown') return;
          
          // 初期化
          if (!teamStats[awayTeamId]) {
            teamStats[awayTeamId] = { wins: 0, losses: 0, draws: 0 };
          }
          if (!teamStats[homeTeamId]) {
            teamStats[homeTeamId] = { wins: 0, losses: 0, draws: 0 };
          }
          
          // 勝敗を記録
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

    // セ・リーグとパ・リーグに分類
    const centralTeams = ['giants', 'hanshin', 'dragons', 'baystars', 'carp', 'swallows'];
    const pacificTeams = ['hawks', 'lions', 'eagles', 'marines', 'fighters', 'buffaloes'];

    const createStandings = (teams: string[]): Standing[] => {
      return teams
        .map(teamId => {
          const stats = teamStats[teamId] || { wins: 0, losses: 0, draws: 0 };
          const games = stats.wins + stats.losses + stats.draws;
          const winRate = games > 0 ? stats.wins / (stats.wins + stats.losses) : 0;
          
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
        .filter(standing => standing.games > 0) // 試合がないチームは除外
        .sort((a, b) => b.winRate - a.winRate)
        .map((standing, index) => {
          const rank = index + 1;
          const firstPlaceWinRate = index === 0 ? standing.winRate : 0;
          const gamesBehind = index === 0 ? 0 : (firstPlaceWinRate - standing.winRate) * (standing.wins + standing.losses);
          
          return {
            ...standing,
            rank,
            gamesBehind,
          };
        });
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

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`[REQUEST] ${year}年${month}月の順位表リクエスト`);
  console.log(`[TIME] ${new Date().toISOString()}`);

  try {
    // 1秒の遅延
    await delay(SCRAPING_DELAY);

    const data = await scrapeMonthlyStandings(year, month);
    const responseTime = Date.now() - startTime;

    console.log(`[SUCCESS] 順位表データ取得完了`);
    console.log(`[PERFORMANCE] 総レスポンス時間: ${responseTime}ms`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    return NextResponse.json(
      {
        year,
        month,
        ...data,
        timestamp: new Date().toISOString(),
        responseTime,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
          'CDN-Cache-Control': `public, max-age=${CACHE_DURATION}`,
          'Vercel-CDN-Cache-Control': `max-age=${CACHE_DURATION}`,
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

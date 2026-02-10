import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const CACHE_DURATION = 180; // 3分（秒）
const SCRAPING_DELAY = 5000; // 5秒

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// チーム名マッピング（略称 → TeamId）
const TEAM_NAME_MAP: Record<string, string> = {
  '巨': 'giants',
  '神': 'hanshin',
  '阪': 'hanshin',
  '中': 'dragons',
  '広': 'carp',
  'Ｄ': 'baystars',
  'De': 'baystars',
  'デ': 'baystars',
  'ヤ': 'swallows',
  'ソ': 'hawks',
  '西': 'lions',
  '楽': 'eagles',
  'ロ': 'marines',
  '日': 'fighters',
  'オ': 'buffaloes',
};

function getTeamId(teamName: string): string {
  return TEAM_NAME_MAP[teamName] || 'unknown';
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

interface ScrapedData {
  year: string;
  month: string;
  games: GameData[];
  scrapedAt: string;
}

// NPB公式サイトからスクレイピング
async function scrapeNPBData(year: string, month: string): Promise<ScrapedData> {
  console.log(`[SCRAPING] NPB公式サイトへアクセス: ${year}年${month}月`);

  const url = `https://npb.jp/bis/${year}/calendar/index_${month.padStart(2, '0')}.html`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'NPB-Live-Dashboard/1.0 (Educational Purpose)',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const games: GameData[] = [];

    // カレンダーテーブルからデータ抽出
    $('table td[nowrap="nowrap"]').each((index, element) => {
      const $td = $(element);
      const dateLink = $td.find('a').first();

      if (dateLink.length > 0) {
        const date = dateLink.text().trim();
        const matches: MatchData[] = [];

        // 試合情報を抽出（詳細URLも含む）
        $td.find('a').each((i, link) => {
          const $link = $(link);
          const text = $link.text().trim();
          const href = $link.attr('href');

          // スコア形式のリンク（例: "巨 5 - 2 中"）
          const scoreMatch = text.match(/^(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+?)$/);
          if (scoreMatch && href && href.includes('s' + year)) {
            const awayTeamName = scoreMatch[1].trim();
            const homeTeamName = scoreMatch[4].trim();
            const detailUrl = href.startsWith('http') ? href : `https://npb.jp${href}`;

            matches.push({
              away: awayTeamName,
              awayTeamId: getTeamId(awayTeamName),
              awayScore: parseInt(scoreMatch[2]),
              homeScore: parseInt(scoreMatch[3]),
              home: homeTeamName,
              homeTeamId: getTeamId(homeTeamName),
              url: detailUrl,
              detailUrl: detailUrl,
            });
          }
        });

        if (matches.length > 0) {
          games.push({
            date: `${month}月${date}日`,
            matches: matches,
          });
        }
      }
    });

    console.log(`[SUCCESS] ${games.length}日分のデータを取得`);

    return {
      year,
      month,
      games,
      scrapedAt: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ERROR] スクレイピング失敗:', errorMessage);
    throw new Error(`スクレイピング失敗: ${errorMessage}`);
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get('year') || '2025';
  const month = searchParams.get('month') || '10';

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`[REQUEST] ${year}年${month}月のデータリクエスト`);
  console.log(`[CLIENT] IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`);
  console.log(`[TIME] ${new Date().toISOString()}`);
  console.log(`[VERCEL CACHE] ${request.headers.get('x-vercel-cache') || 'NONE'}`);

  console.log(`[DELAY START] ${SCRAPING_DELAY / 1000}秒の遅延を開始`);

  // 5秒の遅延（必ず実行）
  await delay(SCRAPING_DELAY);

  console.log(`[DELAY END] 遅延完了、スクレイピング開始`);

  try {
    // スクレイピング実行
    const data = await scrapeNPBData(year, month);

    const responseTime = Date.now() - startTime;

    console.log(`[SUCCESS] データ取得完了`);
    console.log(`[PERFORMANCE] 総レスポンス時間: ${responseTime}ms`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Vercel Edge Cacheヘッダー
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=180, stale-while-revalidate=360');
    headers.set('CDN-Cache-Control', 'public, max-age=180');
    headers.set('Vercel-CDN-Cache-Control', 'max-age=180');
    headers.set('X-Cache-Status', 'MISS');
    headers.set('X-Cache-Duration', CACHE_DURATION.toString());
    headers.set('X-Response-Time', responseTime.toString());

    return NextResponse.json(
      {
        ...data,
        cacheStatus: 'MISS',
        cacheRemaining: CACHE_DURATION,
        responseTime: responseTime,
        timestamp: new Date().toISOString(),
      },
      { headers }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[ERROR] ${errorMessage}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const headers = new Headers();
    headers.set('X-Cache-Status', 'ERROR');

    return NextResponse.json(
      {
        error: errorMessage,
        cacheStatus: 'ERROR',
      },
      { status: 500, headers }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;

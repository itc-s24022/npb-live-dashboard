import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const SCRAPING_DELAY = 3000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface InningScore {
  inning: number;
  away: number | string;
  home: number | string;
}

interface GameDetailData {
  gameId: string;
  date: string;
  stadium: string;
  attendance: number | null;
  time: string;
  duration: string | null;
  inningScores: InningScore[];
  homeScore: number;
  awayScore: number;
  status: string;
}

async function scrapeGameDetail(url: string): Promise<GameDetailData> {
  const response = await axios.get(url, {
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NPB-Live-Dashboard/1.0; +https://npb-live-dashboard.vercel.app)',
    },
  });

  const $ = cheerio.load(response.data);
  
  const gameId = url.split('/').pop()?.replace('.html', '') || '';
  const date = $('.game-date').text().trim() || '未定';
  const stadium = $('.stadium-name').text().trim() || '未設定';
  const attendanceText = $('.attendance').text().trim();
  const attendance = attendanceText ? parseInt(attendanceText.replace(/[^\d]/g, ''), 10) : null;
  const gameTime = $('.game-time').text().trim() || '18:00';
  const duration = $('.game-duration').text().trim() || null;
  
  const inningScores: InningScore[] = [];
  $('.scoreboard tr').each((index, element) => {
    if (index === 0) return; // ヘッダー行をスキップ
    const inning = index;
    const away = $(element).find('td').eq(1).text().trim() || '0';
    const home = $(element).find('td').eq(2).text().trim() || '0';
    inningScores.push({
      inning,
      away: isNaN(parseInt(away)) ? away : parseInt(away),
      home: isNaN(parseInt(home)) ? home : parseInt(home),
    });
  });

  const homeScore = parseInt($('.home-score').text().trim()) || 0;
  const awayScore = parseInt($('.away-score').text().trim()) || 0;
  const status = $('.game-status').text().trim() || '試合終了';

  return {
    gameId,
    date,
    stadium,
    attendance,
    time: gameTime,
    duration,
    inningScores,
    homeScore,
    awayScore,
    status,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URLパラメータが必要です' },
      { status: 400 }
    );
  }

  const startTime = Date.now();
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
  const vercelCache = request.headers.get('x-vercel-cache') || 'none';

  console.log('=== Game Detail API Request ===');
  console.log('URL:', url);
  console.log('Client IP:', clientIP);
  console.log('Time:', new Date().toISOString());
  console.log('Vercel Cache:', vercelCache);

  try {
    await delay(SCRAPING_DELAY);

    const data = await scrapeGameDetail(url);
    const responseTime = Date.now() - startTime;

    console.log('=== Game Detail API Response ===');
    console.log('Game ID:', data.gameId);
    console.log('Response time:', responseTime, 'ms');

    return NextResponse.json(
      {
        ...data,
        cacheStatus: vercelCache !== 'none' ? 'HIT' : 'MISS',
        responseTime,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'public, max-age=300',
          'Vercel-CDN-Cache-Control': 'max-age=300',
          'X-Cache-Status': vercelCache !== 'none' ? 'HIT' : 'MISS',
          'X-Response-Time': `${responseTime}ms`,
        },
      }
    );
  } catch (error) {
    console.error('Game Detail scraping error:', error);
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        error: 'スクレイピングに失敗しました',
        message: error instanceof Error ? error.message : '不明なエラー',
        responseTime,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'X-Cache-Status': 'ERROR',
          'X-Response-Time': `${responseTime}ms`,
        },
      }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const SCRAPING_DELAY = 1000;
const CACHE_DURATION = 86400;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game IDが必要です' },
        { status: 400 }
      );
    }

    console.log(`[Game Detail API] Fetching data for gameId: ${gameId}`);

    await delay(SCRAPING_DELAY);

    const url = `https://npb.jp/bis/2025/games/${gameId}.html`;
    console.log(`[Game Detail API] URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const tables = $('table');
    console.log(`[Game Detail API] Found ${tables.length} tables`);

    // テーブル0から球場と試合情報を取得
    const firstTable = tables.eq(0);
    const firstRow = firstTable.find('tr').first();
    const cells = firstRow.find('td');
    
    const stadium = $(cells[0]).text().trim();
    const infoText = $(cells[1]).text().trim();
    
    console.log(`[Game Detail API] Stadium: ${stadium}`);
    console.log(`[Game Detail API] Info: ${infoText}`);
    
    const timeMatch = infoText.match(/試合時間\s*-\s*([\d：]+)\s*\(\s*開始([\d:]+)\s*終了([\d:]+)\s*\)/);
    const duration = timeMatch ? timeMatch[1] : '';
    const startTime = timeMatch ? timeMatch[2] : '';
    const endTime = timeMatch ? timeMatch[3] : '';

    const attendanceMatch = infoText.match(/入場者\s*-\s*([\d,]+)/);
    const attendance = attendanceMatch ? parseInt(attendanceMatch[1].replace(/,/g, '')) : 0;

    // テーブル1からスコア情報を取得
    const scoreTable = tables.eq(1);
    const scoreRows = scoreTable.find('tr');
    
    const awayRow = scoreRows.eq(1);
    const homeRow = scoreRows.eq(2);

    const awayTeam = awayRow.find('td').first().text().trim();
    const homeTeam = homeRow.find('td').first().text().trim();

    console.log(`[Game Detail API] Teams: ${awayTeam} vs ${homeTeam}`);

    // イニングスコアを取得
    const parseInningScores = (row: cheerio.Cheerio<cheerio.Element>) => {
      const cells = row.find('td');
      const scores: number[] = [];
      
      for (let i = 1; i < cells.length; i++) {
        const cellText = $(cells[i]).text().trim();
        
        if (cellText === 'Ｒ' || cellText === 'Ｈ' || cellText === 'Ｅ') {
          break;
        }
        
        if (cellText === '' || cellText === '-' || cellText === 'X') {
          continue;
        }
        
        const score = parseInt(cellText);
        if (!isNaN(score)) {
          scores.push(score);
        }
      }
      
      return scores;
    };

    const awayInningScores = parseInningScores(awayRow);
    const homeInningScores = parseInningScores(homeRow);

    // R, H, E を取得
    const getLastThreeValues = (row: cheerio.Cheerio<cheerio.Element>) => {
      const cells = row.find('td');
      const r = parseInt($(cells[cells.length - 3]).text().trim()) || 0;
      const h = parseInt($(cells[cells.length - 2]).text().trim()) || 0;
      const e = parseInt($(cells[cells.length - 1]).text().trim()) || 0;
      return { r, h, e };
    };

    const awayRHE = getLastThreeValues(awayRow);
    const homeRHE = getLastThreeValues(homeRow);

    // 投手情報を取得
    const pitcherTable = tables.eq(2);
    const pitcherRows = pitcherTable.find('tr');
    
    let winningPitcher = '';
    let losingPitcher = '';
    let savePitcher = '';

    pitcherRows.each((_, row) => {
      const rowText = $(row).text();
      if (rowText.includes('勝投手')) {
        winningPitcher = $(row).find('td').eq(1).text().trim();
      } else if (rowText.includes('敗投手')) {
        losingPitcher = $(row).find('td').eq(1).text().trim();
      } else if (rowText.includes('セーブ')) {
        savePitcher = $(row).find('td').eq(1).text().trim();
      }
    });

    const gameData = {
      gameId,
      date: '2025年06月01日',
      stadium,
      attendance,
      time: `${startTime}`,
      endTime: `${endTime}`,
      duration,
      inningScores: {
        away: awayInningScores,
        home: homeInningScores,
      },
      homeScore: homeRHE.r,
      awayScore: awayRHE.r,
      homeTeam,
      awayTeam,
      runs: {
        away: awayRHE.r,
        home: homeRHE.r,
      },
      hits: {
        away: awayRHE.h,
        home: homeRHE.h,
      },
      errors: {
        away: awayRHE.e,
        home: homeRHE.e,
      },
      status: '試合終了',
      winningPitcher: winningPitcher || undefined,
      losingPitcher: losingPitcher || undefined,
      savePitcher: savePitcher || undefined,
    };

    const responseTime = Date.now() - startTime;
    console.log(`[Game Detail API] Success - Response time: ${responseTime}ms`);

    return NextResponse.json(gameData, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}`,
      },
    });

  } catch (error) {
    console.error('[Game Detail API] Error:', error);
    return NextResponse.json(
      { error: 'データ取得に失敗しました' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';

const SCRAPING_DELAY = 1000;
const CACHE_DURATION = 86400;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  const requestStartTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ error: 'Game IDが必要です' }, { status: 400 });
    }

    await delay(SCRAPING_DELAY);

    // gameIdから年を抽出 (例: s2025040100115 → 2025)
    const yearMatch = gameId.match(/s(\d{4})/);
    const gameYear = yearMatch ? yearMatch[1] : '2025';

    const url = `https://npb.jp/bis/${gameYear}/games/${gameId}.html`;
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
    
    // テーブル4: 球場と試合情報
    const infoTable = tables.eq(4);
    const infoRow = infoTable.find('tr').first();
    const infoCells = infoRow.find('td');
    
    const stadium = $(infoCells.eq(0)).text().trim();
    const infoText = $(infoCells.eq(1)).text().trim();
    
    // 試合時間、開始・終了時刻を抽出
    const timeMatch = infoText.match(/試合時間\s*-\s*([\d：]+)\s*\(\s*開始([\d:]+)\s*終了([\d:]+)\s*\)/);
    const duration = timeMatch ? timeMatch[1].replace('：', ':') : '';
    const gameStartTime = timeMatch ? timeMatch[2] : '';
    const endTime = timeMatch ? timeMatch[3] : '';
    
    // 入場者数を抽出
    const attendanceMatch = infoText.match(/入場者\s*-\s*([\d,]+)/);
    const attendance = attendanceMatch ? parseInt(attendanceMatch[1].replace(/,/g, '')) : 0;

    console.log(`[API] Stadium: ${stadium}, Duration: ${duration}, Time: ${gameStartTime}-${endTime}, Attendance: ${attendance}`);

    // テーブル5: スコアテーブル
    const scoreTable = tables.eq(5);
    const scoreRows = scoreTable.find('tr');
    
    // 行1: ビジターチーム
    // 行2: ホームチーム
    const awayRow = scoreRows.eq(1);
    const homeRow = scoreRows.eq(2);
    
    // チーム名を取得
    const awayTeam = awayRow.find('td').eq(0).text().trim();
    const homeTeam = homeRow.find('td').eq(0).text().trim();
    
    console.log(`[API] Away: ${awayTeam}, Home: ${homeTeam}`);

    // スコア解析関数
    const parseScoreRow = (row: cheerio.Cheerio<Element>) => {
      const cells = row.find('td');
      const innings: number[] = [];
      let r = 0, h = 0, e = 0;
      
      // '-'の位置を探す
      let dashIndex = -1;
      cells.each((idx, cell) => {
        if ($(cell).text().trim() === '-') {
          dashIndex = idx;
        }
      });
      
      if (dashIndex === -1) {
        console.log('[API] Warning: No dash found in row');
        return { innings: [], r: 0, h: 0, e: 0 };
      }
      
      // '-'の後の3つがR/H/E
      r = parseInt($(cells[dashIndex + 1]).text().trim()) || 0;
      h = parseInt($(cells[dashIndex + 2]).text().trim()) || 0;
      e = parseInt($(cells[dashIndex + 3]).text().trim()) || 0;
      
      // チーム名の後から'-'の前までがイニングスコア
      for (let i = 1; i < dashIndex; i++) {
        const text = $(cells[i]).text().trim();
        if (text === '' || text === 'X') {
          continue; // 空セルとXをスキップ
        }
        const score = parseInt(text);
        if (!isNaN(score)) {
          innings.push(score);
        }
      }
      
      return { innings, r, h, e };
    };
    
    const awayData = parseScoreRow(awayRow);
    const homeData = parseScoreRow(homeRow);

    console.log(`[API] Away: R=${awayData.r}, H=${awayData.h}, E=${awayData.e}, Innings=[${awayData.innings.join(',')}]`);
    console.log(`[API] Home: R=${homeData.r}, H=${homeData.h}, E=${homeData.e}, Innings=[${homeData.innings.join(',')}]`);

    // gameIdから日付を抽出 (例: s2025040100115 → 2025年04月01日)
    const dateMatch = gameId.match(/s(\d{4})(\d{2})(\d{2})/);
    const gameDate = dateMatch
      ? `${dateMatch[1]}年${dateMatch[2]}月${dateMatch[3]}日`
      : '';

    // ステータス判定
    let status = '試合終了';
    if (duration === '' && gameStartTime === '') {
      status = '未設定';
    }

    const gameData = {
      gameId,
      date: gameDate,
      stadium,
      attendance,
      time: gameStartTime,
      endTime,
      duration,
      inningScores: {
        away: awayData.innings,
        home: homeData.innings,
      },
      awayScore: awayData.r,
      homeScore: homeData.r,
      awayTeam,
      homeTeam,
      runs: {
        away: awayData.r,
        home: homeData.r,
      },
      hits: {
        away: awayData.h,
        home: homeData.h,
      },
      errors: {
        away: awayData.e,
        home: homeData.e,
      },
      status,
    };

    const responseTime = Date.now() - requestStartTime;
    console.log(`[API] Response time: ${responseTime}ms`);

    return NextResponse.json(gameData, {
      headers: { 'Cache-Control': `public, s-maxage=${CACHE_DURATION}` },
    });

  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json({ error: 'データ取得に失敗しました' }, { status: 500 });
  }
}

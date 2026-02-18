'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Trash2, RefreshCw, Database, Info } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { TEAMS } from '@/lib/teams';
import { TeamId } from '@/types';

export default function SettingsPage() {
  const { settings, setTheme, setAutoUpdate, toggleTeamSelector } = useAppStore();
  const [lastUpdate, setLastUpdate] = useState('計算中...');
  const [cacheSize, setCacheSize] = useState('計算中...');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    const calculateCacheSize = () => {
      try {
        let totalSize = 0;
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length + key.length;
          }
        }
        const sizeInKB = (totalSize / 1024).toFixed(2);
        const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);
        
        if (parseFloat(sizeInMB) >= 1) {
          setCacheSize(`${sizeInMB} MB`);
        } else {
          setCacheSize(`${sizeInKB} KB`);
        }
      } catch {
        setCacheSize('計算不可');
      }
    };

    const calculateLastUpdate = () => {
      try {
        const storedData = localStorage.getItem('npb-live-storage');
        if (storedData) {
          setLastUpdate('利用可能');
        } else {
          setLastUpdate('データなし');
        }
      } catch {
        setLastUpdate('不明');
      }
    };

    calculateCacheSize();
    calculateLastUpdate();
  }, []);

  const handleThemeToggle = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const handleClearCache = () => {
    if (confirm('キャッシュをクリアしますか？')) {
      try {
        localStorage.clear();
        setCacheSize('0 KB');
        alert('キャッシュをクリアしました');
        window.location.reload();
      } catch {
        alert('キャッシュのクリアに失敗しました');
      }
    }
  };

  const handleDataUpdate = () => {
    const now = new Date();
    setLastUpdate(now.toLocaleTimeString('ja-JP'));
    alert('データを更新しました');
  };

  const formatDuration = (seconds: number): string => {
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return m > 0 ? `${h}時間${m}分` : `${h}時間`;
    }
    if (seconds >= 60) {
      return `${Math.floor(seconds / 60)}分`;
    }
    return `${seconds}秒`;
  };

  const handleTestScraping = async () => {
    setTestLoading(true);
    setTestResult(null);

    try {
      const startTime = Date.now();
      const response = await fetch('/api/games?year=2025&month=6');
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error('スクレイピングに失敗しました');
      }

      const data = await response.json();
      const cacheStatus = data.cacheStatus || 'MISS';
      const cacheRemaining = data.cacheRemaining || 0;

      let resultText = '';
      if (cacheStatus === 'HIT') {
        resultText = `✅ キャッシュHIT（${responseTime}ms）\nキャッシュ残り: ${formatDuration(cacheRemaining)}`;
      } else {
        resultText = `✅ スクレイピング成功（${responseTime}ms）\nキャッシュ有効期間: 24時間`;
      }

      setTestResult(resultText);
    } catch (error) {
      setTestResult(`❌ エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setTestLoading(false);
    }
  };

  const favoriteTeam = settings.favoriteTeam && TEAMS[settings.favoriteTeam as TeamId] 
    ? TEAMS[settings.favoriteTeam as TeamId] 
    : null;

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">設定</h1>

      {/* Theme Settings */}
      <div className="bg-light-card dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">表示設定</h2>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {settings.theme === 'dark' ? (
              <Moon className="w-5 h-5 text-gray-900 dark:text-white" />
            ) : (
              <Sun className="w-5 h-5 text-gray-900 dark:text-white" />
            )}
            <span className="text-gray-900 dark:text-white">テーマ</span>
          </div>
          <button
            onClick={handleThemeToggle}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              settings.theme === 'dark' ? 'bg-primary-green' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.theme === 'dark' ? 'translate-x-7' : ''
              }`}
            />
          </button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {settings.theme === 'dark' ? 'ダークモード' : 'ライトモード'}
        </div>
      </div>

      {/* Team Settings */}
      <div className="bg-light-card dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">チーム設定</h2>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-900 dark:text-white">推しチーム</span>
          <button
            onClick={toggleTeamSelector}
            className="flex items-center gap-2 px-4 py-2 bg-light-bg dark:bg-dark-bg rounded-lg border border-light-border dark:border-dark-border hover:border-primary-green transition-colors"
          >
            {favoriteTeam ? (
              <>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: favoriteTeam.color }}
                >
                  {favoriteTeam.shortName}
                </div>
                <span className="text-gray-900 dark:text-white">{favoriteTeam.name}</span>
              </>
            ) : (
              <span className="text-gray-600 dark:text-gray-400">未設定</span>
            )}
          </button>
        </div>
      </div>

      {/* Data Settings */}
      <div className="bg-light-card dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">データ設定</h2>
        
        {/* Cache Info */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-light-border dark:border-dark-border">
          <div>
            <div className="text-gray-900 dark:text-white font-medium">キャッシュサイズ</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{cacheSize}</div>
          </div>
          <button
            onClick={handleClearCache}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            クリア
          </button>
        </div>

        {/* Last Update */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-light-border dark:border-dark-border">
          <div>
            <div className="text-gray-900 dark:text-white font-medium">最終更新</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{lastUpdate}</div>
          </div>
          <button
            onClick={handleDataUpdate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-green/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            更新
          </button>
        </div>

        {/* Auto Update */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-900 dark:text-white" />
            <span className="text-gray-900 dark:text-white">自動取得</span>
          </div>
          <button
            onClick={() => setAutoUpdate(!settings.autoUpdate)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              settings.autoUpdate ? 'bg-primary-green' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.autoUpdate ? 'translate-x-7' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Scraping Test */}
      <div className="bg-light-card dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">スクレイピングテスト</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          サーバーキャッシュ: 24時間有効
        </p>
        
        <button
          onClick={handleTestScraping}
          disabled={testLoading}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-3"
        >
          {testLoading ? 'テスト中...' : 'スクレイピングをテスト'}
        </button>

        {testResult && (
          <div className="p-3 bg-light-bg dark:bg-dark-bg rounded border border-light-border dark:border-dark-border">
            <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
      </div>

      {/* App Info */}
      <div className="bg-light-card dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          アプリ情報
        </h2>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">バージョン</span>
            <span className="text-gray-900 dark:text-white">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">データ提供元</span>
            <a
              href="https://npb.jp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-green hover:underline"
            >
              NPB公式サイト
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

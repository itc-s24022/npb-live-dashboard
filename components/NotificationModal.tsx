'use client';

import { useState, useEffect } from 'react';
import { NotificationSettings, NPB_TEAMS } from '@/types/notification';
import { getNotificationSettings, saveNotificationSettings } from '@/lib/storage';
import { requestNotificationPermission } from '@/lib/notification';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getNotificationSettings());
      setHasPermission(
        typeof window !== 'undefined' && Notification.permission === 'granted'
      );
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (settings.enabled && !hasPermission) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert('通知を有効にするには、ブラウザの通知許可が必要です');
        return;
      }
      setHasPermission(true);
      settings.browserNotificationEnabled = granted;
    }

    saveNotificationSettings(settings);
    alert('設定を保存しました！');
    onClose();
  };

  const toggleTeam = (team: string) => {
    setSettings((prev) => ({
      ...prev,
      favoriteTeams: prev.favoriteTeams.includes(team)
        ? prev.favoriteTeams.filter((t) => t !== team)
        : [...prev.favoriteTeams, team],
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-light-border dark:border-dark-border">
        <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border sticky top-0 bg-light-card dark:bg-dark-card z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🔔 通知設定</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-lg transition-colors"
            aria-label="閉じる"
            type="button"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">通知を有効にする</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                お気に入りチームの試合情報を通知します
              </p>
            </div>
            <label className="relative inline-block w-14 h-8 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-primary-green transition-colors" />
              <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-md" />
            </label>
          </div>

          {settings.enabled && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">通知するタイミング</h3>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyGameStart}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifyGameStart: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-primary-green focus:ring-primary-green cursor-pointer"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">試合開始1時間前</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      試合開始の1時間前に通知します
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyGameEnd}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifyGameEnd: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-primary-green focus:ring-primary-green cursor-pointer"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">試合終了時</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      試合が終了したら結果を通知します
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyDaily}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifyDaily: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-primary-green focus:ring-primary-green cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">日次サマリー</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      毎日指定した時刻に試合予定を通知します
                    </p>
                    {settings.notifyDaily && (
                      <input
                        type="time"
                        value={settings.dailyNotifyTime}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            dailyNotifyTime: e.target.value,
                          }))
                        }
                        className="px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white"
                      />
                    )}
                  </div>
                </label>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">お気に入りチーム</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  通知を受け取りたいチームを選択してください（未選択の場合は全チーム）
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {NPB_TEAMS.map((team) => (
                    <button
                      key={team}
                      onClick={() => toggleTeam(team)}
                      type="button"
                      className={`px-4 py-3 rounded-lg border-2 text-left transition-all ${
                        settings.favoriteTeams.includes(team)
                          ? 'border-primary-green bg-primary-green/10 font-semibold text-gray-900 dark:text-white'
                          : 'border-light-border dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      {team}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg sticky bottom-0">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2 border border-light-border dark:border-dark-border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-light-card dark:hover:bg-dark-card transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            type="button"
            className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-green/90 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

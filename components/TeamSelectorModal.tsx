'use client';

import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getCentralLeagueTeams, getPacificLeagueTeams } from '@/lib/teams';
import { TeamId } from '@/types';

export default function TeamSelectorModal() {
  const pathname = usePathname();
  const { showTeamSelector, toggleTeamSelector, setSelectedTeam, setFavoriteTeam, filter, settings } = useAppStore();
  
  const isSettingsPage = pathname === '/settings';

  if (!showTeamSelector) return null;

  const handleTeamSelect = (teamId: TeamId | 'all') => {
    if (isSettingsPage) {
      setFavoriteTeam(teamId === 'all' ? null : teamId);
    } else {
      setSelectedTeam(teamId);
    }
  };

  const centralTeams = getCentralLeagueTeams();
  const pacificTeams = getPacificLeagueTeams();

  const selectedTeamId = isSettingsPage 
    ? settings.favoriteTeam 
    : (filter.selectedTeam === 'all' ? null : filter.selectedTeam);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={toggleTeamSelector}
    >
      <div
        className="bg-light-card dark:bg-dark-card rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isSettingsPage ? '推しチームを選択' : 'チームで絞り込み'}
          </h2>
          <button
            onClick={toggleTeamSelector}
            className="p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-6">
          {/* All Teams Option (only for filtering) */}
          {!isSettingsPage && (
            <button
              onClick={() => handleTeamSelect('all')}
              className={`w-full p-4 rounded-lg border transition-colors flex items-center gap-3 ${
                !selectedTeamId
                  ? 'bg-primary-green/10 border-primary-green'
                  : 'bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border hover:border-primary-green'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-xl">🏟️</span>
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-900 dark:text-white">全チーム</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">すべての試合を表示</div>
              </div>
            </button>
          )}

          {/* Central League */}
          <div>
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3">セントラル・リーグ</h3>
            <div className="space-y-2">
              {centralTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSelect(team.id)}
                  className={`w-full p-4 rounded-lg border transition-colors flex items-center gap-3 ${
                    selectedTeamId === team.id
                      ? 'bg-primary-green/10 border-primary-green'
                      : 'bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border hover:border-primary-green'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.shortName}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900 dark:text-white">{team.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pacific League */}
          <div>
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3">パシフィック・リーグ</h3>
            <div className="space-y-2">
              {pacificTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSelect(team.id)}
                  className={`w-full p-4 rounded-lg border transition-colors flex items-center gap-3 ${
                    selectedTeamId === team.id
                      ? 'bg-primary-green/10 border-primary-green'
                      : 'bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border hover:border-primary-green'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.shortName}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900 dark:text-white">{team.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

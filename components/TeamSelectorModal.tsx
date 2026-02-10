'use client';

import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getCentralLeagueTeams, getPacificLeagueTeams } from '@/lib/teams';
import { TeamId } from '@/types';

export default function TeamSelectorModal() {
  const pathname = usePathname();
  const { uiState, closeAllModals, filter, setSelectedTeam, settings, setFavoriteTeam } = useAppStore();
  const selectedTeam = filter.selectedTeam;

  const centralTeams = getCentralLeagueTeams();
  const pacificTeams = getPacificLeagueTeams();

  const isSettingsPage = pathname === '/settings';

  if (!uiState.isTeamSelectorOpen) return null;

  const handleTeamSelect = (teamId: TeamId | 'all') => {
    if (isSettingsPage) {
      setFavoriteTeam(teamId === 'all' ? null : teamId);
      setSelectedTeam(teamId);
    } else {
      setSelectedTeam(teamId);
    }
    closeAllModals();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-light-card dark:bg-dark-card w-full sm:max-w-2xl sm:rounded-lg rounded-t-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isSettingsPage ? '推しチームを選択' : 'チームを選択'}
          </h2>
          <button
            onClick={closeAllModals}
            className="p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-900 dark:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* All Teams Option */}
          {!isSettingsPage && (
            <div>
              <button
                onClick={() => handleTeamSelect('all')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedTeam === 'all'
                    ? 'border-primary-green bg-primary-green/10'
                    : 'border-light-border dark:border-dark-border hover:border-primary-green'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-white font-bold">ALL</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">全チーム</span>
                </div>
              </button>
            </div>
          )}

          {/* Central League */}
          <div>
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3">セントラル・リーグ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {centralTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSelect(team.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    (isSettingsPage ? settings.favoriteTeam : selectedTeam) === team.id
                      ? 'border-primary-green bg-primary-green/10'
                      : 'border-light-border dark:border-dark-border hover:border-primary-green'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.shortName}
                    </div>
                    <span className="text-gray-900 dark:text-white font-medium">{team.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pacific League */}
          <div>
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3">パシフィック・リーグ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pacificTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSelect(team.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    (isSettingsPage ? settings.favoriteTeam : selectedTeam) === team.id
                      ? 'border-primary-green bg-primary-green/10'
                      : 'border-light-border dark:border-dark-border hover:border-primary-green'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.shortName}
                    </div>
                    <span className="text-gray-900 dark:text-white font-medium">{team.name}</span>
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

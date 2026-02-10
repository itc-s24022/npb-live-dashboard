'use client';

import { Users } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { TEAMS } from '@/lib/teams';

export default function TeamFilter() {
  const { filter, toggleTeamSelector } = useAppStore();
  const selectedTeam = filter.selectedTeam;

  const displayText = selectedTeam === 'all' 
    ? '全チーム' 
    : TEAMS[selectedTeam].name;

  const displayColor = selectedTeam === 'all' 
    ? undefined 
    : TEAMS[selectedTeam].color;

  return (
    <button
      onClick={toggleTeamSelector}
      className="w-full mt-4 p-3 bg-light-bg dark:bg-dark-bg rounded-lg border border-light-border dark:border-dark-border hover:border-primary-green transition-colors flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        {selectedTeam === 'all' ? (
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: displayColor }}
          >
            {TEAMS[selectedTeam].shortName}
          </div>
        )}
        <span className="text-gray-900 dark:text-white font-medium">{displayText}</span>
      </div>
      <svg
        className="w-5 h-5 text-gray-600 dark:text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

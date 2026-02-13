import { Team, TeamId } from '@/types';

export const TEAMS: Record<TeamId, Team> = {
  // セントラル・リーグ
  giants: {
    id: 'giants',
    name: '読売ジャイアンツ',
    shortName: '巨',
    color: '#F97316',
    league: 'central',
  },
  hanshin: {
    id: 'hanshin',
    name: '阪神タイガース',
    shortName: '神',
    color: '#FFE500',
    league: 'central',
  },
  baystars: {
    id: 'baystars',
    name: '横浜DeNAベイスターズ',
    shortName: 'デ',
    color: '#0EA5E9',
    league: 'central',
  },
  carp: {
    id: 'carp',
    name: '広島東洋カープ',
    shortName: '広',
    color: '#DC2626',
    league: 'central',
  },
  swallows: {
    id: 'swallows',
    name: '東京ヤクルトスワローズ',
    shortName: 'ヤ',
    color: '#059669',
    league: 'central',
  },
  dragons: {
    id: 'dragons',
    name: '中日ドラゴンズ',
    shortName: '中',
    color: '#0284C7',
    league: 'central',
  },

  // パシフィック・リーグ
  hawks: {
    id: 'hawks',
    name: '福岡ソフトバンクホークス',
    shortName: 'ソ',
    color: '#FCD34D',
    league: 'pacific',
  },
  fighters: {
    id: 'fighters',
    name: '北海道日本ハムファイターズ',
    shortName: '日',
    color: '#0EA5E9',
    league: 'pacific',
  },
  marines: {
    id: 'marines',
    name: '千葉ロッテマリーンズ',
    shortName: 'ロ',
    color: '#1E293B',
    league: 'pacific',
  },
  eagles: {
    id: 'eagles',
    name: '東北楽天ゴールデンイーグルス',
    shortName: '楽',
    color: '#991B1B',
    league: 'pacific',
  },
  buffaloes: {
    id: 'buffaloes',
    name: 'オリックス・バファローズ',
    shortName: 'オ',
    color: '#1E3A8A',
    league: 'pacific',
  },
  lions: {
    id: 'lions',
    name: '埼玉西武ライオンズ',
    shortName: '西',
    color: '#0369A1',
    league: 'pacific',
  },
};

export function getCentralLeagueTeams(): Team[] {
  return Object.values(TEAMS).filter((team) => team.league === 'central');
}

export function getPacificLeagueTeams(): Team[] {
  return Object.values(TEAMS).filter((team) => team.league === 'pacific');
}

export function getTeamById(id: TeamId): Team | undefined {
  return TEAMS[id];
}

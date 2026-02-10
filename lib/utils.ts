import { Game, CalendarDay, TeamId } from '@/types';

export function getMonthCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const firstDayOfWeek = firstDay.getDay();

  const days: CalendarDay[] = [];

  // 前月の日付で埋める
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevMonthDay = new Date(year, month - 1, -firstDayOfWeek + i + 1);
    days.push({
      date: prevMonthDay,
      day: prevMonthDay.getDate(),
      isCurrentMonth: false,
    });
  }

  // 当月の日付
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month - 1, i),
      day: i,
      isCurrentMonth: true,
    });
  }

  // 次月の日付で埋める（42マス = 6週間分）
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const nextMonthDay = new Date(year, month, i);
    days.push({
      date: nextMonthDay,
      day: nextMonthDay.getDate(),
      isCurrentMonth: false,
    });
  }

  return days;
}

export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return format
    .replace('yyyy', String(year))
    .replace('MM', String(month).padStart(2, '0'))
    .replace('dd', String(day).padStart(2, '0'));
}

export function getGamesByDate(games: Game[], date: Date): Game[] {
  const dateStr = formatDate(date, 'yyyy-MM-dd');
  return games.filter((game) => game.date === dateStr);
}

export function filterGamesByTeam(games: Game[], teamId: TeamId | 'all'): Game[] {
  if (teamId === 'all') return games;
  return games.filter(
    (game) => game.homeTeam === teamId || game.awayTeam === teamId
  );
}

export function getTeamGameResult(
  game: Game,
  teamId: TeamId
): 'win' | 'loss' | 'draw' | null {
  const isHome = game.homeTeam === teamId;
  const isAway = game.awayTeam === teamId;

  if (!isHome && !isAway) return null;

  if (game.homeScore === game.awayScore) return 'draw';

  if (isHome) {
    return game.homeScore > game.awayScore ? 'win' : 'loss';
  } else {
    return game.awayScore > game.homeScore ? 'win' : 'loss';
  }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

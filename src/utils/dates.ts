const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayString(): string {
  return toDateString(new Date());
}

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(baseDateStr: string, offsetDays: number): string {
  const date = parseDateString(baseDateStr);
  date.setDate(date.getDate() + offsetDays);
  return toDateString(date);
}

export function getDiffDays(targetDateStr: string, todayStr: string): number {
  const target = parseDateString(targetDateStr);
  const today = parseDateString(todayStr);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((target.getTime() - today.getTime()) / msPerDay);
}

export function formatShortDate(dateStr: string): string {
  const date = parseDateString(dateStr);
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

export function formatFullDate(dateStr: string): string {
  const date = parseDateString(dateStr);
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatOverdueDays(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'} overdue`;
}

export function formatDueDateDisplay(
  dateStr: string,
  diffDays: number,
  isDone: boolean,
  isBlocked: boolean
): { text: string; isOverdueText: boolean } {
  if (!isDone && !isBlocked && diffDays < 0) {
    const days = Math.abs(diffDays);
    return {
      text: `${formatShortDate(dateStr)} · ${formatOverdueDays(days)}`,
      isOverdueText: true,
    };
  }
  if (!isDone && diffDays < 0 && isBlocked) {
    const days = Math.abs(diffDays);
    return {
      text: `${formatShortDate(dateStr)} · ${days} ${days === 1 ? 'day' : 'days'} past due`,
      isOverdueText: false,
    };
  }
  if (!isDone && diffDays === 0) {
    return {
      text: `Today · ${formatShortDate(dateStr)}`,
      isOverdueText: false,
    };
  }
  if (!isDone && diffDays === 1) {
    return {
      text: `Tomorrow · ${formatShortDate(dateStr)}`,
      isOverdueText: false,
    };
  }
  return {
    text: formatShortDate(dateStr),
    isOverdueText: false,
  };
}

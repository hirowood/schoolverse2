const WEEK_START_DAY = 1; // Monday

function formatIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function startOfWeek(reference: Date | string = new Date(), weekStartsOn = WEEK_START_DAY): Date {
  const date = typeof reference === "string" ? new Date(reference) : new Date(reference);
  const day = date.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfWeek(reference: Date | string = new Date(), weekStartsOn = WEEK_START_DAY): Date {
  const start = startOfWeek(reference, weekStartsOn);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function buildWeekDays(start: Date): string[] {
  const days: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const current = new Date(start);
    current.setDate(current.getDate() + i);
    days.push(formatIsoDate(current));
  }
  return days;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours}h${String(remainingMinutes).padStart(2, "0")}m`;
  }
  return `${remainingMinutes}m`;
}

export function getEffectiveSeconds(
  opts: { totalWorkTime?: number; status?: string; lastStartedAt?: Date | string | null },
  reference: Date = new Date()
): number {
  let total = opts.totalWorkTime ?? 0;
  if (opts.status === "in_progress" && opts.lastStartedAt) {
    const started = typeof opts.lastStartedAt === "string" ? new Date(opts.lastStartedAt) : opts.lastStartedAt;
    if (started && !Number.isNaN(started.getTime())) {
      total += Math.floor((reference.getTime() - started.getTime()) / 1000);
    }
  }
  return total;
}

export function toIsoDate(date: Date): string {
  return formatIsoDate(date);
}

export function buildWeekLabel(start: Date, end: Date): string {
  return `${formatIsoDate(start)}〜${formatIsoDate(end)}`;
}

export function formatDayLabel(dateIso: string): string {
  const [, month, day] = dateIso.split("-");
  return `${month}/${day}`;
}

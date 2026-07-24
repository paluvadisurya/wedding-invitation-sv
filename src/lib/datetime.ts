import { site } from '@/config/site';

/**
 * India Standard Time is a fixed UTC+05:30 with no daylight saving, which lets
 * us build exact instants from a date and a wall-clock time without pulling in
 * a timezone database.
 */
const IST_OFFSET = '+05:30';

/** `('2026-08-26', '05:00')` → the exact instant, in IST. */
export function instant(date: string, time: string): Date {
  return new Date(`${date}T${time}:00${IST_OFFSET}`);
}

const dateFmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-GB', { ...opts, timeZone: site.timeZone });

const fWeekday = dateFmt({ weekday: 'long' });
const fWeekdayShort = dateFmt({ weekday: 'short' });
const fDayNum = dateFmt({ day: 'numeric' });
const fMonth = dateFmt({ month: 'long' });
const fMonthShort = dateFmt({ month: 'short' });
const fFull = dateFmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const weekday = (d: string) => fWeekday.format(instant(d, '12:00'));
export const weekdayShort = (d: string) => fWeekdayShort.format(instant(d, '12:00'));
export const dayNumber = (d: string) => fDayNum.format(instant(d, '12:00'));
export const monthName = (d: string) => fMonth.format(instant(d, '12:00'));
export const monthShort = (d: string) => fMonthShort.format(instant(d, '12:00'));
export const fullDate = (d: string) => fFull.format(instant(d, '12:00'));

/**
 * `'07:00'` → `'7 AM'`, `'17:30'` → `'5:30 PM'`.
 * Whole hours drop their `:00`, because "7 AM" is how anyone would say it.
 */
export function clock(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * The line a guest reads: `'7 AM – lunch'`, `'5 – 7 PM'`, `'6 PM – midnight'`.
 * Collapses a shared AM/PM across the range the way a person writing by hand
 * would, and defers to `endLabel` when the ceremony truly ends at a meal.
 */
export function timeRange(
  start: string | null,
  end: string | null,
  endLabel?: string,
): string | null {
  if (!start) return null;
  if (endLabel) return `${clock(start)} – ${endLabel}`;
  if (!end) return clock(start);

  const startPeriod = Number(start.split(':')[0]) < 12 ? 'AM' : 'PM';
  const endPeriod = Number(end.split(':')[0]) < 12 ? 'AM' : 'PM';
  if (startPeriod === endPeriod) {
    return `${clock(start).replace(` ${startPeriod}`, '')} – ${clock(end)}`;
  }
  return `${clock(start)} – ${clock(end)}`;
}

/** Days between two instants, rounded down. Negative once the date has passed. */
export function daysUntil(target: Date, from: Date = new Date()): number {
  return Math.floor((target.getTime() - from.getTime()) / 86_400_000);
}

/** `YYYYMMDDTHHMMSSZ`, the only date format an .ics file accepts. */
export function icsStamp(d: Date): string {
  return `${d.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

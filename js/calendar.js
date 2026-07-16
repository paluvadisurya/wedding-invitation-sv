/* Add-to-calendar helpers — Google Calendar links + downloadable .ics files.
   Everything is derived from config.json event data; nothing is hard-coded. */

function toUTCStamp(date) {
  // 2026-08-26T05:30:00.000Z → 20260826T053000Z
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function icsEscape(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export function eventDates(ev) {
  const start = new Date(ev.startISO);
  const end = new Date(start.getTime() + (ev.durationMinutes || 120) * 60000);
  return { start, end };
}

export function googleCalUrl({ title, details, location, ev, timeZone }) {
  const { start, end } = eventDates(ev);
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toUTCStamp(start)}/${toUTCStamp(end)}`,
    details,
    location,
    ctz: timeZone || 'Asia/Kolkata',
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

export function downloadICS({ title, details, location, ev }) {
  const { start, end } = eventDates(ev);
  const now = toUTCStamp(new Date());
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${ev.id}-${start.getTime()}@wedding-invite`,
    `DTSTAMP:${now}`,
    `DTSTART:${toUTCStamp(start)}`,
    `DTEND:${toUTCStamp(end)}`,
    `SUMMARY:${icsEscape(title)}`,
    `DESCRIPTION:${icsEscape(details)}`,
    `LOCATION:${icsEscape(location)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT12H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsEscape(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${ev.id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

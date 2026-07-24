/* ============================================================================
 *  THE CEREMONIES
 *
 *  The order of this array is the order of the site. Delete an event to remove
 *  it everywhere; add one and it appears everywhere, including the calendar
 *  files and the RSVP form.
 *
 *  `meaning` is the one line a guest who has never attended a South Indian
 *  wedding will read. Where we were not certain of a ceremony's meaning we
 *  left it `null` rather than guess — the site renders that as a quiet,
 *  designed state. Those are marked  ← FILL IN  below.
 *
 *  Times are 24-hour, Asia/Kolkata. `end` should always hold a real time even
 *  when the ceremony truly ends at "lunch", because calendar apps need one;
 *  `endLabel` is what guests actually see.
 * ========================================================================== */

import type { WeddingEvent } from './types';

const noVenue = { name: null, address: null, mapsUrl: null };

export const events: WeddingEvent[] = [
  /* ---- PRELUDE — before the two households part ------------------------- */
  {
    id: 'engagement',
    name: 'Engagement',
    meaning:
      'Rings exchanged and the match blessed — the day both families said yes out loud, in front of everyone.',
    side: 'both',
    phase: 'prelude',
    townId: 'hyderabad',
    venue: {
      name: 'My Home Sayuk',
      address: 'Tellapally, Hyderabad', //  ← FILL IN  full address for drivers
      mapsUrl: null, //  ← FILL IN  a real Maps pin
    },
    date: '2026-07-09',
    start: '07:00',
    end: '15:00',
    travel: null,
    stay: 'A room in the function hall.',
    confidence: 'confirmed',
  },
  {
    id: 'pre-wedding-shoot',
    name: 'Pre-Wedding Shoot',
    meaning:
      'A day with the camera, before the noise begins. The photographs on this site will grow from it.',
    side: 'both',
    phase: 'prelude',
    townId: 'hyderabad',
    venue: noVenue,
    date: null,
    dateApprox: 'First week of August',
    start: '08:00',
    end: '16:00',
    travel: null,
    stay: null,
    confidence: 'tentative',
  },

  /* ---- PARALLEL — two towns, 300km apart, the same mornings -------------- */
  {
    id: 'pellikoothuru',
    name: 'Pellikoothuru',
    pronunciation: 'pel-li-koo-thu-ru',
    meaning:
      'The ceremony that makes Srivalli a bride: bathed in turmeric water, dressed in new silk, and blessed by the elders of her family.',
    side: 'bride',
    phase: 'parallel',
    townId: 'wanaparthy',
    venue: noVenue,
    date: '2026-08-23',
    start: '07:00',
    end: '13:00',
    endLabel: 'lunch',
    travel: 'Coach from Hyderabad.',
    stay: 'A room near the venue.',
    confidence: 'confirmed',
  },
  {
    id: 'pellikoduku',
    name: 'Pellikoduku',
    pronunciation: 'pel-li-ko-du-ku',
    meaning:
      'The same rite, the same morning, 300km away: Surya is bathed, dressed and blessed by his family as a groom.',
    side: 'groom',
    phase: 'parallel',
    townId: 'vinukonda',
    venue: noVenue,
    date: '2026-08-23',
    start: '07:00',
    end: '13:00',
    endLabel: 'lunch',
    travel: 'Coach from Hyderabad.',
    stay: 'A room near the venue.',
    confidence: 'confirmed',
  },
  {
    id: 'brides-haldi',
    name: 'Haldi',
    meaning:
      'Turmeric — pasupu — ground into a paste and pressed onto the skin by everyone who loves her. It is messy, loud, and the photographs are always the best ones.',
    side: 'bride',
    phase: 'parallel',
    townId: 'wanaparthy',
    venue: noVenue,
    date: '2026-08-24',
    start: '07:00',
    end: '13:00',
    endLabel: 'lunch',
    travel: 'Coach from Hyderabad.',
    stay: 'A room near the venue.',
    confidence: 'confirmed',
  },
  {
    id: 'grooms-haldi',
    name: 'Haldi',
    meaning:
      'The mirror of it, in Vinukonda. The same turmeric, the same yellow hands, a different courtyard.',
    side: 'groom',
    phase: 'parallel',
    townId: 'vinukonda',
    venue: noVenue,
    date: '2026-08-24',
    start: '08:00',
    end: '13:00',
    endLabel: 'lunch',
    travel: 'Coach from Hyderabad.',
    stay: 'A room near the venue.',
    confidence: 'confirmed',
  },

  /* ---- CONFLUENCE — 25 August. The two towns become one room ------------- */
  {
    id: 'kotnam',
    name: 'Kotnam',
    meaning: null, //  ← FILL IN  one line: what Kotnam is, for a guest who has never seen it
    side: 'bride',
    phase: 'confluence',
    townId: 'wanaparthy',
    venue: noVenue,
    date: '2026-08-25',
    start: '07:00',
    end: '13:00',
    endLabel: 'lunch',
    travel: 'By car, Vinukonda → Wanaparthy.',
    stay: 'A room in the function hall.',
    confidence: 'confirmed',
  },
  {
    id: 'edurukollu',
    name: 'Edurukollu',
    pronunciation: 'e-du-ru-kol-lu',
    meaning:
      'Literally, to go out and receive. Srivalli’s family walks out to meet Surya’s as they arrive from Vinukonda, and brings them in. This is the hour the two sides of this page finally become one.',
    side: 'both',
    phase: 'confluence',
    townId: 'wanaparthy',
    venue: noVenue,
    date: '2026-08-25',
    start: '17:00',
    end: '19:00',
    travel: 'By car, Vinukonda → Wanaparthy.',
    stay: 'A room in the function hall.',
    confidence: 'confirmed',
  },
  {
    id: 'sangeet',
    name: 'Sangeet',
    meaning:
      'The first night everybody is in the same place. Music, dancing, and both families finding out what the other is like after dark.',
    side: 'both',
    phase: 'confluence',
    townId: 'wanaparthy',
    venue: noVenue,
    date: '2026-08-25',
    start: '19:00',
    end: '23:00',
    travel: 'By car, Vinukonda → Wanaparthy.',
    stay: 'A room in the function hall.',
    confidence: 'confirmed',
  },

  /* ---- UNION — the wedding ---------------------------------------------- */
  {
    id: 'wedding',
    name: 'Wedding & Odugu',
    meaning:
      'The muhurtham — the exact auspicious minute the priest has chosen. Everything on this page has been walking toward it.',
    detail: null, //  ← FILL IN  one line on Odugu, which follows the muhurtham
    side: 'both',
    phase: 'union',
    townId: 'wanaparthy',
    venue: noVenue,
    date: '2026-08-26',
    start: '05:00',
    end: '15:00',
    travel: null,
    stay: 'A room in the function hall.',
    confidence: 'confirmed',
    isMuhurtham: true,
  },

  /* ---- JOURNEY — the celebration moves to Vinukonda --------------------- */
  {
    id: 'vratham',
    name: 'Vratham',
    pronunciation: 'vra-tham',
    meaning:
      'A vow, observed together — the couple’s first rite as a married pair, quiet and early, before the evening.',
    side: 'both',
    phase: 'journey',
    townId: 'vinukonda',
    venue: noVenue,
    date: '2026-08-28',
    start: '08:00',
    end: '11:00',
    travel: null,
    stay: 'A room near the venue.',
    confidence: 'confirmed',
  },
  {
    id: 'reception',
    name: 'Reception',
    meaning:
      'The last night. Dinner, everyone in one room, and no ritual left to perform — only the celebrating.',
    side: 'both',
    phase: 'journey',
    townId: 'vinukonda',
    venue: noVenue,
    date: '2026-08-28',
    start: '18:00',
    end: '23:59',
    endLabel: 'midnight',
    travel: 'By car, Wanaparthy → Vinukonda. Return travel is arranged.',
    stay: 'A room near the venue.',
    confidence: 'confirmed',
  },
];

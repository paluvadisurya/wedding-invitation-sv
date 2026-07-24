/* ============================================================================
 *  THE WEDDING — who, when, where.
 *
 *  This is the file to edit first. Everything here is plain data; you do not
 *  need to know how to code to change it. Anything you set to `null` renders
 *  as a deliberate "to be confirmed" state, so it is always safe to leave a
 *  blank until you know the answer.
 *
 *  Lines marked  ← FILL IN  are the ones still waiting on you.
 * ========================================================================== */

import type { Contact, Couple, Muhurtham, Town, TownId } from './types';

export const couple: Couple = {
  bride: {
    name: 'Srivalli',
    parents: null, //  ← FILL IN  e.g. 'Daughter of Lakshmi & Ramesh Rao'
    townId: 'wanaparthy',
  },
  groom: {
    name: 'Surya',
    parents: null, //  ← FILL IN  e.g. 'Son of Padma & Venkat Paluvadi'
    townId: 'vinukonda',
  },
  //  How the two names are set in the masthead: 'ampersand' | 'stacked'
  lockup: 'ampersand',
  hashtag: '#SrivalliWedsSurya',
};

/**
 * The wedding day is fixed. The exact auspicious hour usually is not, until
 * the family priest sets it — so leave `time` as null until you have it and
 * the site will say "the wedding morning" instead of inventing a minute.
 */
export const muhurtham: Muhurtham = {
  date: '2026-08-26',
  time: null, //  ← FILL IN  e.g. '05:45' (24-hour clock)
  provisionalStart: '05:00',
};

export const towns: Record<TownId, Town> = {
  hyderabad: {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    blurb: 'Where the families first met, and where the coaches leave from.',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hyderabad%2C+Telangana',
  },
  wanaparthy: {
    id: 'wanaparthy',
    name: 'Wanaparthy',
    state: 'Telangana',
    blurb: 'Srivalli’s town, south-west of Hyderabad.',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Wanaparthy%2C+Telangana',
  },
  vinukonda: {
    id: 'vinukonda',
    name: 'Vinukonda',
    state: 'Andhra Pradesh',
    blurb: 'Surya’s town, east across the state border in Andhra Pradesh.',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Vinukonda%2C+Andhra+Pradesh',
  },
};

/**
 * The people a guest should ring when they are lost, late, or unsure.
 * A contact with a `null` phone is hidden entirely — no dead links.
 */
export const contacts: Contact[] = [
  {
    name: null, //  ← FILL IN
    role: 'Bride’s side — travel & stay in Wanaparthy',
    side: 'bride',
    phone: null, //  ← FILL IN  digits only with country code, e.g. '919876543210'
    whatsapp: true,
  },
  {
    name: null, //  ← FILL IN
    role: 'Groom’s side — travel & stay in Vinukonda',
    side: 'groom',
    phone: null, //  ← FILL IN
    whatsapp: true,
  },
  {
    name: null, //  ← FILL IN
    role: 'Coaches from Hyderabad',
    side: 'both',
    phone: null, //  ← FILL IN
    whatsapp: true,
  },
];

/**
 * Road distances between the towns, in kilometres, for the journey marker on
 * the timeline. Add a pair and the number appears; leave one out and the
 * marker simply shows the route without a figure. Better a missing number than
 * a wrong one.
 */
export const roadDistanceKm: Partial<Record<string, number>> = {
  'wanaparthy-vinukonda': 300,
  //  ← FILL IN, if you want them shown
  // 'hyderabad-wanaparthy': 0,
  // 'hyderabad-vinukonda': 0,
};

export function distanceBetween(a: TownId, b: TownId): number | null {
  return roadDistanceKm[`${a}-${b}`] ?? roadDistanceKm[`${b}-${a}`] ?? null;
}

/** Convenience: the two towns the celebrations actually run in. */
export const brideTown = towns[couple.bride.townId];
export const groomTown = towns[couple.groom.townId];

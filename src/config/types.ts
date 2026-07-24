/**
 * The shapes every config file in this folder must satisfy.
 *
 * A note on `null`: throughout this site, `null` means "not decided yet" and is
 * a first-class, designed state — never an empty cell or a broken layout. Any
 * component receiving `null` must render something deliberate. Do not write
 * "TBD" as a string; write `null` and let the UI say it properly.
 */

/** Which family's celebration this is. `both` means everyone, together. */
export type Side = 'bride' | 'groom' | 'both';

/**
 * The narrative spine of these five days, and the reason the schedule is not a
 * single vertical list. Ordered; the site renders phases in this sequence.
 *
 *   prelude     — before the two households separate. Hyderabad.
 *   parallel    — two towns, 300km apart, mirroring each other, same days.
 *   confluence  — 25 August. The groom's party travels; the families meet.
 *   union       — the wedding itself. One thread.
 *   journey     — the celebration moves to Vinukonda.
 */
export type Phase = 'prelude' | 'parallel' | 'confluence' | 'union' | 'journey';

/** `tentative` renders with the dashed treatment and an honest label. */
export type Confidence = 'confirmed' | 'tentative';

export type TownId = 'hyderabad' | 'wanaparthy' | 'vinukonda';

export interface Town {
  id: TownId;
  name: string;
  state: string;
  /** One line a guest can hold in their head. */
  blurb: string;
  /** `null` until a pin is dropped. */
  mapsUrl: string | null;
}

export interface Venue {
  /** e.g. "My Home Sayuk". `null` if the hall is not booked or not yet named. */
  name: string | null;
  /** Full street address for a driver at 5 AM. `null` until confirmed. */
  address: string | null;
  /** A real Google Maps pin, not a search query, once you have one. */
  mapsUrl: string | null;
}

export interface WeddingEvent {
  id: string;
  /**
   * Kept in its original Telugu, transliterated. These are proper nouns; they
   * are not translated. The English explanation lives in `meaning`.
   */
  name: string;
  /** Optional respelling to help a guest say it out loud. */
  pronunciation?: string;
  /**
   * One short line: what this ceremony is, for someone who has never attended
   * a South Indian wedding. `null` renders as a designed "still being written"
   * state — far better than inventing something wrong.
   */
  meaning: string | null;
  /** Optional second line for the ceremony guide only. */
  detail?: string | null;

  side: Side;
  phase: Phase;
  townId: TownId;
  venue: Venue;

  /** ISO date `YYYY-MM-DD`, or `null` when only an approximate window is known. */
  date: string | null;
  /** Shown when `date` is null. e.g. "First week of August". */
  dateApprox?: string;

  /** 24h `HH:mm`, local to Asia/Kolkata. */
  start: string | null;
  /**
   * 24h `HH:mm`. Always give a best estimate even when the true end is "lunch"
   * — calendar files need a real time. What guests *see* is `endLabel`.
   */
  end: string | null;
  /** Overrides the clock in the UI. e.g. "lunch". Some things end at a meal. */
  endLabel?: string;

  /** Verbatim from the family's schedule. `null` = nothing to say yet. */
  travel: string | null;
  stay: string | null;

  confidence: Confidence;
  /** Exactly one event should carry this. It anchors the countdown. */
  isMuhurtham?: boolean;
  dressCode?: string | null;
}

export interface Person {
  name: string | null;
  /** "daughter of …" / "son of …" — the families, named. */
  parents: string | null;
  /** Which town this side of the family celebrates in. */
  townId: TownId;
}

export interface Couple {
  bride: Person;
  groom: Person;
  /**
   * How the two names are set together in the masthead. `ampersand` sets them
   * on two lines joined by a hairline rule; `stacked` sets them as two blocks.
   */
  lockup: 'ampersand' | 'stacked';
  hashtag: string | null;
}

/**
 * The muhurtham. Its exact hour is often fixed late by the family priest, so
 * this models "we know the day, not yet the minute" as a real state.
 */
export interface Muhurtham {
  /** The wedding day. `YYYY-MM-DD`. */
  date: string;
  /**
   * The auspicious hour, `HH:mm`, once the priest has set it. While this is
   * `null` the countdown runs to `provisionalStart` and says so plainly.
   */
  time: string | null;
  /** Where the countdown points until `time` is known. */
  provisionalStart: string;
}

export interface Contact {
  name: string | null;
  /** "Bride's side — travel & stay" etc. Say what they can actually help with. */
  role: string;
  side: Side;
  /** E.164, digits only, e.g. "919876543210". `null` hides the contact. */
  phone: string | null;
  whatsapp?: boolean;
}

export interface Photo {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Optional caption shown in the gallery. */
  caption?: string;
}

/** A coach from Hyderabad to one of the two towns. */
export interface BusRoute {
  id: string;
  townId: TownId;
  label: string;
  /** e.g. "Departs Hyderabad 22 Aug, 9 PM". `null` until fixed. */
  departure: string | null;
  boardingPoint: string | null;
  mapsUrl: string | null;
  note: string | null;
}

export type SectionId =
  | 'invitation'
  | 'countdown'
  | 'confluence'
  | 'ceremonies'
  | 'story'
  | 'travel'
  | 'gallery'
  | 'rsvp'
  | 'blessings';

export interface SiteConfig {
  /** Absolute origin, no trailing slash. Falls back to VERCEL_URL at runtime. */
  url: string;
  title: string;
  description: string;
  /** Unlisted by default: reachable by link, invisible to search engines. */
  indexable: boolean;
  timeZone: string;
  /** Turn any section off here. The page must not break when one is missing. */
  sections: Record<SectionId, boolean>;
}

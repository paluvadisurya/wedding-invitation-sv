/* ============================================================================
 *  SITE SETTINGS — the switchboard.
 *
 *  Turn any section off by setting it to `false`. The page is built so that
 *  removing a section never breaks the ones around it: the thread that runs
 *  down the site re-joins itself, and nothing is left dangling.
 * ========================================================================== */

import type { SiteConfig } from './types';

export const site: SiteConfig = {
  /**
   * The site's own address, no trailing slash. Used for share links and the
   * WhatsApp preview image. On Vercel this is filled in automatically from the
   * deployment URL, so you only need to set it once you have a real domain —
   * either here, or as the NEXT_PUBLIC_SITE_URL environment variable.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://srivalli-surya.vercel.app',

  title: 'Srivalli & Surya',
  description:
    'Two towns, five days, one wedding. Srivalli and Surya are getting married on 26 August 2026, and their families would like you there.',

  /**
   * `false` keeps the site out of Google entirely while leaving it instantly
   * open to anyone with the link. Recommended: this page carries phone numbers,
   * home towns and a guest list.
   */
  indexable: false,

  timeZone: 'Asia/Kolkata',

  sections: {
    invitation: true,
    countdown: true,
    confluence: true,
    ceremonies: true,
    story: true,
    travel: true,
    gallery: true,
    rsvp: true,
    blessings: true,
  },
};

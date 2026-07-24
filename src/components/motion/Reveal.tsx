'use client';

import { useEffect } from 'react';

/**
 * The entire motion system for this site: one IntersectionObserver, mounted
 * once, which marks elements as they arrive. Everything else — what moves, how
 * far, in what order — is declared in CSS against `[data-reveal]`.
 *
 * There is no animation library here on purpose. A wedding invitation opened on
 * a mid-range Android phone over rural 4G cannot afford thirty kilobytes of
 * JavaScript to fade some text in.
 *
 * The hidden state is applied only under `[data-motion='on']`, which a tiny
 * blocking script in the document head sets before first paint — and only when
 * the guest has not asked for reduced motion. So if that script never runs, if
 * JavaScript fails, or if motion is unwelcome, every element simply renders in
 * its final state and nothing is ever stuck invisible.
 */
export function Reveal() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.motion !== 'on') return;
    // Tells the failsafe in the head that the observer is alive.
    root.dataset.motionReady = '1';

    const targets = document.querySelectorAll('[data-reveal]:not([data-revealed])');

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.setAttribute('data-revealed', ''));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-revealed', '');
          io.unobserve(entry.target);
        }
      },
      // Fires a little before the element is centred, so the procession keeps
      // pace with the scroll rather than lagging behind it.
      { rootMargin: '-4% 0px -12% 0px', threshold: 0.01 },
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}

/**
 * Set before first paint so there is never a flash of visible-then-hidden
 * content. Kept as a string because it must run inline, ahead of hydration.
 */
export const motionBootstrap = [
  `try{`,
  `var d=document.documentElement;`,
  `if(!matchMedia('(prefers-reduced-motion: reduce)').matches){`,
  `d.dataset.motion='on';`,
  // Failsafe: if hydration never happens, nothing may stay invisible. After
  // three seconds without the observer checking in, the page reverts to the
  // still, complete version.
  `setTimeout(function(){if(d.dataset.motionReady!=='1'){delete d.dataset.motion}},3000);`,
  `}}catch(e){}`,
].join('');

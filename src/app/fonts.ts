import localFont from 'next/font/local';

/**
 * Two families, both variable, both self-hosted, both subset and instanced
 * down to what this site actually uses. See scripts/build-fonts.sh.
 *
 * Fraunces — display. Axes kept: opsz 9–144, wght 100–900.
 *   SOFT is pinned to 0 (sharp, chiselled terminals — carved rather than soft)
 *   and WONK to 1 (the characterful alternate forms). Optical sizing is left
 *   on `auto`, so the letterforms genuinely re-cut themselves as they scale:
 *   fine hairlines and tight spacing at 124px, sturdier at 20px.
 *
 * Anek Latin — text and UI. Axes kept: wght 100–800. Drawn by the Indian Type
 *   Foundry as the Latin companion to a nine-script Indic superfamily, so its
 *   proportions were negotiated against Telugu rather than imposed on it.
 */

export const display = localFont({
  src: '../fonts/Fraunces.subset.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-display',
  preload: true,
  // Tuned against Fraunces' metrics so the fallback occupies near-identical
  // space — the swap should not move the page.
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  adjustFontFallback: 'Times New Roman',
});

export const text = localFont({
  src: '../fonts/AnekLatin.subset.woff2',
  weight: '100 800',
  style: 'normal',
  display: 'swap',
  variable: '--font-text',
  preload: true,
  fallback: [
    'ui-sans-serif',
    'system-ui',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'sans-serif',
  ],
  adjustFontFallback: 'Arial',
});

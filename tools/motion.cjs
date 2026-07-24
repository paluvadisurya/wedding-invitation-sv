const { chromium } = require('playwright');
(async () => {
  const [url, out, w, h, y] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  await p.evaluate(() => document.fonts.ready);
  // Walk down in steps so the observer fires naturally, as a guest would scroll.
  for (let s = 0; s <= +y; s += 400) {
    await p.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), s);
    await p.waitForTimeout(90);
  }
  await p.waitForTimeout(2600);
  await p.screenshot({ path: out });
  const hidden = await p.evaluate(() => document.querySelectorAll('[data-reveal]:not([data-revealed])').length);
  console.log('still unrevealed anywhere on page:', hidden);
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });

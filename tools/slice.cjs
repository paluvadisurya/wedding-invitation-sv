const { chromium } = require('playwright');
(async () => {
  const [url, out, w, h, ...ys] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const reduce = process.env.REDUCE === '1';
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, reducedMotion: reduce ? 'reduce' : 'no-preference' });
  await p.goto(url, { waitUntil: 'networkidle' });
  // The page uses smooth scrolling; force instant jumps or we photograph the
  // scroll animation rather than the destination.
  await p.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  await p.evaluate(() => document.fonts.ready);
  for (const y of ys) {
    await p.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), +y);
    await p.waitForTimeout(400);
    const at = await p.evaluate(() => Math.round(window.scrollY));
    await p.screenshot({ path: out.replace('.png', `-${y}.png`) });
    console.log(`asked ${y}, landed ${at}`);
  }
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });

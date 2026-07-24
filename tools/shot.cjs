const { chromium } = require('playwright');
(async () => {
  const [url, out, w, h, full] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.screenshot({ path: out, fullPage: full === 'full' });
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });

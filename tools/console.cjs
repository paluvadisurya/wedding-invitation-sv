const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const msgs = [];
  p.on('console', m => { if (['error','warning'].includes(m.type())) msgs.push(`[${m.type()}] ${m.text()}`); });
  p.on('pageerror', e => msgs.push(`[pageerror] ${e.message}`));
  await p.goto(process.argv[2], { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  console.log(msgs.length ? msgs.join('\n---\n') : 'no console errors or warnings');
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });

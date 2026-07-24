const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: +(process.argv[3]||390), height: 844 } });
  await p.goto(process.argv[2] || 'http://localhost:3000/', { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => {
    const items = [...document.querySelectorAll('ol > li')];
    let prevBottom = null; const out = [];
    for (const el of items) {
      const b = el.getBoundingClientRect();
      const top = Math.round(b.top + scrollY), h = Math.round(b.height);
      const cls = (el.getAttribute('class') || '').replace(/^.*__/, '');
      const gap = prevBottom === null ? 0 : top - prevBottom;
      out.push({ cls, top, h, gap, txt: (el.textContent || '').trim().slice(0, 24) });
      prevBottom = top + h;
    }
    return { total: document.body.scrollHeight, out };
  });
  console.log('page', r.total);
  for (const x of r.out) console.log(String(x.top).padStart(5), String(x.h).padStart(4), (x.gap ? `GAP ${x.gap}` : '   ok').padEnd(9), x.cls.padEnd(11), JSON.stringify(x.txt));
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });

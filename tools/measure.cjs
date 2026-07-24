const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  const rows = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('#days *').forEach(el => {
      const cls = (el.getAttribute('class')||'').split(' ')[0];
      if (!cls) return;
      const r = el.getBoundingClientRect();
      if (r.height > 60 && el.children.length <= 3) {
        out.push({ cls, tag: el.tagName, top: Math.round(r.top + scrollY), h: Math.round(r.height), text: (el.textContent||'').slice(0,28) });
      }
    });
    return { total: document.body.scrollHeight, rows: out.slice(0, 60) };
  });
  console.log('page height', rows.total);
  for (const r of rows.rows) console.log(String(r.top).padStart(5), String(r.h).padStart(5), r.cls.padEnd(30), r.tag.padEnd(8), JSON.stringify(r.text));
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });

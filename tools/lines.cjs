const { chromium } = require('playwright');
(async () => {
  const w = +(process.argv[3] || 390);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  await p.goto(process.argv[2], { waitUntil: 'networkidle' });
  const segs = await p.evaluate(() => {
    const out = [];
    // Straight runs
    document.querySelectorAll('span[data-lane]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.height < 12) return;
      out.push({ x: Math.round(r.left + r.width / 2), t: Math.round(r.top + scrollY), b: Math.round(r.bottom + scrollY), k: 'run' });
    });
    // Shaped segments (svg): use the svg box, endpoints are at its edges
    document.querySelectorAll('svg').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.height < 12) return;
      out.push({ x: Math.round(r.left + r.width / 2), t: Math.round(r.top + scrollY), b: Math.round(r.bottom + scrollY), k: 'svg' });
    });
    return out.sort((a, b2) => a.t - b2.t);
  });
  // Walk down the page: the union of all segments should have no vertical hole.
  let cover = segs.map(s => [s.t, s.b]).sort((a, b2) => a[0] - b2[0]);
  let merged = [];
  for (const [t, bt] of cover) {
    if (merged.length && t <= merged[merged.length - 1][1] + 2) merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], bt);
    else merged.push([t, bt]);
  }
  console.log(`width ${w}: ${segs.length} drawn segments`);
  if (merged.length === 1) console.log(`  UNBROKEN from y=${merged[0][0]} to y=${merged[0][1]}`);
  else merged.forEach((m, i) => {
    if (i) console.log(`  >>> BREAK of ${m[0] - merged[i-1][1]}px between y=${merged[i-1][1]} and y=${m[0]}`);
    console.log(`  covered ${m[0]} .. ${m[1]}`);
  });
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });

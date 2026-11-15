const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
  await page.goto('https://mog-market.vercel.app/app?shot=1', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(14000);

  const deck = await page.$('.deck-wrap');
  await deck.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  const first = await page.$('.deck-row .mpc');
  await first.hover();
  await page.waitForTimeout(1800);

  const box = await first.evaluate(el => {
    const b = el.getBoundingClientRect();
    const wrap = el.parentElement.getBoundingClientRect();
    const go = el.querySelector('.mpc-go')?.getBoundingClientRect();
    const info = el.querySelector('.mpc-info');
    return {
      card: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)],
      wrapW: Math.round(wrap.width),
      go: go ? [Math.round(go.x), Math.round(go.y), Math.round(go.width), Math.round(go.height)] : null,
      infoScroll: info ? { sh: info.scrollHeight, ch: info.clientHeight } : null,
    };
  });
  console.log('BOX ' + JSON.stringify(box));

  const overlap = await page.evaluate(() => {
    const pills = [...document.querySelectorAll('.deck-row .mpc')];
    const open = pills.find(p => p.classList.contains('open'));
    if (!open || pills.length < 2) return 'n/a';
    const o = open.getBoundingClientRect();
    let worst = null;
    pills.forEach(p => {
      if (p === open) return;
      const r = p.getBoundingClientRect();
      const ox = Math.min(o.right, r.right) - Math.max(o.left, r.left);
      const oy = Math.min(o.bottom, r.bottom) - Math.max(o.top, r.top);
      if (ox > 2 && oy > 2) worst = Math.max(worst || 0, Math.round(ox));
    });
    return worst;
  });
  console.log('OVERLAP_PX ' + overlap);

  await page.screenshot({ path: 'mog_morph_fixed.png' });
  await browser.close();
})();

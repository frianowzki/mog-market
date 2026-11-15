const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1100 } });
  await p.goto('https://mog-market.vercel.app/app?shot=1', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForTimeout(14000);
  const deck = await p.$('.deck-wrap');
  await deck.scrollIntoViewIfNeeded();
  await p.waitForTimeout(700);
  const first = await p.$('.deck-row .mpc');
  await first.hover();
  await p.waitForTimeout(1800);
  const box = await deck.boundingBox();
  await p.screenshot({ path: 'mog_deck_zoom.png', clip: { x: box.x - 10, y: box.y - 10, width: Math.min(box.width + 20, 1400), height: Math.min(box.height + 20, 700) } });
  const m = await first.evaluate(el => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; });
  console.log('CARD ' + JSON.stringify(m));
  await b.close();
})();

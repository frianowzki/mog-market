const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
  page.on('pageerror', e => errs.push('PAGEERROR: ' + String(e).slice(0, 140)));

  await page.goto('https://mog-market.vercel.app/app?shot=1', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(14000);

  const counts = await page.evaluate(() => ({
    deckRow: document.querySelectorAll('.deck-row').length,
    mpc: document.querySelectorAll('.mpc').length,
    rows: document.querySelectorAll('tr.asset').length,
    heat: document.querySelectorAll('.heat-sq, .hsq').length,
    agr: document.querySelectorAll('canvas').length,
  }));
  console.log('COUNTS ' + JSON.stringify(counts));

  const first = await page.$('.mpc');
  if (first) {
    const before = await first.evaluate(el => Math.round(el.getBoundingClientRect().width));
    await first.hover();
    await page.waitForTimeout(900);
    const after = await first.evaluate(el => ({ w: Math.round(el.getBoundingClientRect().width), open: el.classList.contains('open'), h: Math.round(el.getBoundingClientRect().height) }));
    console.log('MORPH ' + JSON.stringify({ before, ...after }));
    await page.screenshot({ path: 'mog_morph_open.png' });
  } else {
    console.log('MORPH none');
  }

  // scroll to the deck for a full-frame shot
  const deck = await page.$('.deck-wrap');
  if (deck) { await deck.scrollIntoViewIfNeeded(); await page.waitForTimeout(1200); }
  await page.screenshot({ path: 'mog_board.png' });

  console.log('ERRORS ' + JSON.stringify([...new Set(errs)].slice(0, 6)));
  await browser.close();
})();

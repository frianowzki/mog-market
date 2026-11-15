const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  page.on('pageerror', e => errs.push('PAGEERROR: ' + String(e).slice(0, 160)));

  await page.goto('https://mog-market.vercel.app/app', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(6000);

  const counts = await page.evaluate(() => ({
    deckRow: document.querySelectorAll('.deck-row').length,
    mpcWrap: document.querySelectorAll('.mpc-wrap').length,
    mpcBtn: document.querySelectorAll('.mpc').length,
    themeMini: document.querySelectorAll('.theme-mini .theme-sw').length,
    agr: document.querySelectorAll('canvas, .tm-agr').length,
    rows: document.querySelectorAll('tr.asset').length,
  }));
  console.log('COUNTS ' + JSON.stringify(counts));

  // hover the first morph pill card to prove the morph opens
  const first = await page.$('.mpc');
  if (first) {
    const before = await first.evaluate(el => el.getBoundingClientRect().width);
    await first.hover();
    await page.waitForTimeout(700);
    const after = await first.evaluate(el => ({ w: el.getBoundingClientRect().width, open: el.classList.contains('open') }));
    console.log('MORPH ' + JSON.stringify({ before: Math.round(before), after: Math.round(after.w), open: after.open }));
  } else {
    console.log('MORPH none-found');
  }

  await page.screenshot({ path: 'mog_app_live.png', fullPage: false });

  // landing: check footer + gradients visually
  await page.goto('https://mog-market.vercel.app/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  const lgf = await page.evaluate(() => {
    const f = document.querySelector('.lgf');
    if (!f) return null;
    const r = f.getBoundingClientRect();
    return { h: Math.round(r.height), w: Math.round(r.width), cols: f.querySelectorAll('.lgf-inner a').length };
  });
  console.log('FOOTER ' + JSON.stringify(lgf));
  await page.screenshot({ path: 'mog_landing_footer.png' });

  console.log('ERRORS ' + JSON.stringify(errs.slice(0, 8)));
  await browser.close();
})();

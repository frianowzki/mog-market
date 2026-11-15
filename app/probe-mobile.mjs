// Probe the live deck at mobile widths: does the open morph card get clipped?
import { chromium } from "playwright";

const URL = "https://mog-market.vercel.app/app?shot=1";
const sizes = [
  { name: "phone-390", w: 390, h: 844 },
  { name: "phone-360", w: 360, h: 780 },
  { name: "tablet-820", w: 820, h: 1000 },
  { name: "just-above-861", w: 861, h: 1000 },
];

const browser = await chromium.launch();
for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 120)); });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForSelector(".deck-row .mpc", { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(2500);

  const before = await page.evaluate(() => {
    const row = document.querySelector(".deck-row");
    if (!row) return { missing: true };
    const cs = getComputedStyle(row);
    const r = row.getBoundingClientRect();
    return {
      rowH: Math.round(r.height), rowW: Math.round(r.width),
      overflowX: cs.overflowX, overflowY: cs.overflowY,
      cols: cs.gridTemplateColumns, flow: cs.gridAutoFlow,
      scrollW: row.scrollWidth, clientW: row.clientWidth,
      pills: row.querySelectorAll(".mpc").length,
    };
  });

  // tap the first card
  let after = null;
  if (before && !before.missing) {
    await page.evaluate(() => document.querySelector(".deck-row .mpc").click());
    await page.waitForTimeout(900);
    after = await page.evaluate(() => {
      const row = document.querySelector(".deck-row");
      const card = document.querySelector(".deck-row .mpc.open");
      const wrap = card?.parentElement;
      const rr = row.getBoundingClientRect();
      const cr = card?.getBoundingClientRect();
      const wr = wrap?.getBoundingClientRect();
      const clippedV = cr ? Math.max(0, Math.round(cr.bottom - rr.bottom)) : null;
      const clippedH = cr ? Math.max(0, Math.round(cr.right - rr.right)) : null;
      return {
        card: cr ? { w: Math.round(cr.width), h: Math.round(cr.height), top: Math.round(cr.top - rr.top), pos: getComputedStyle(card).position } : null,
        wrap: wr ? { w: Math.round(wr.width), h: Math.round(wr.height) } : null,
        row: { h: Math.round(rr.height), w: Math.round(rr.width) },
        clippedV, clippedH,
        rowScrollH: row.scrollHeight, rowClientH: row.clientHeight,
        overflowY: getComputedStyle(row).overflowY,
      };
    });
  }
  console.log(JSON.stringify({ size: s.name, before, after, errs: errs.slice(0, 3) }));
  await page.screenshot({ path: `probe-${s.name}.png`, fullPage: false });
  await ctx.close();
}
await browser.close();

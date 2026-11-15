// Final check for variant B: does the open card overlap its neighbour?
import { chromium } from "playwright";

const FIX = `
.mpc:not(.open) .mpc-info { flex: 0 0 0; width: 0; max-width: 0; padding-inline: 0; overflow: hidden; }
.deck-row { grid-auto-columns: max-content !important; }
.deck-row .mpc:not(.open) { width: 100% !important; }
`;

const browser = await chromium.launch();
for (const [name, w, h] of [["m390", 390, 844], ["m360", 360, 780], ["d1280", 1280, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto("https://mog-market.vercel.app/app?shot=1", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForSelector(".deck-row .mpc", { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(2200);
  await page.addStyleTag({ content: FIX });
  await page.evaluate(() => document.querySelector(".deck-row .mpc").click());
  await page.waitForTimeout(1000);

  const out = await page.evaluate(() => {
    const pills = [...document.querySelectorAll(".deck-row .mpc")];
    const open = document.querySelector(".deck-row .mpc.open");
    const oi = pills.indexOf(open);
    const r = open.getBoundingClientRect();
    const next = pills[oi + 1]?.getBoundingClientRect();
    const prev = pills[oi - 1]?.getBoundingClientRect();
    const row = document.querySelector(".deck-row").getBoundingClientRect();
    return {
      openW: Math.round(r.width), openH: Math.round(r.height),
      overlapNext: next ? Math.max(0, Math.round(r.right - next.left)) : 0,
      overlapPrev: prev ? Math.max(0, Math.round(prev.right - r.left)) : 0,
      clipRowRight: Math.max(0, Math.round(r.right - row.right)),
      clipRowBottom: Math.max(0, Math.round(r.bottom - row.bottom)),
      rowH: Math.round(row.height),
      docOverflow: document.documentElement.scrollWidth - window.innerWidth,
      pillWidths: pills.slice(0, 3).map((p) => Math.round(p.getBoundingClientRect().width)),
    };
  });
  console.log(name, JSON.stringify(out));
  await page.screenshot({ path: `final-${name}.png` });
  await ctx.close();
}
await browser.close();

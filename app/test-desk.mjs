// Desktop decision: closed pill fills its grid cell (uniform) vs hugs content.
import { chromium } from "playwright";

const FIX = `.mpc:not(.open) .mpc-info { flex: 0 0 0; width: 0; max-width: 0; padding-inline: 0; overflow: hidden; }`;

const browser = await chromium.launch();
for (const [v, extra] of Object.entries({
  fill: FIX + `.deck-row .mpc:not(.open) { width: 100%; }`,
  hug: FIX,
})) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto("https://mog-market.vercel.app/app?shot=1", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForSelector(".deck-row .mpc", { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(2200);
  await page.addStyleTag({ content: extra });
  await page.waitForTimeout(400);
  const info = await page.evaluate(() => {
    const pills = [...document.querySelectorAll(".deck-row .mpc")];
    return {
      widths: pills.slice(0, 5).map((p) => Math.round(p.getBoundingClientRect().width)),
      gaps: pills.slice(0, 4).map((p, i) => {
        const n = pills[i + 1];
        return n ? Math.round(n.getBoundingClientRect().left - p.getBoundingClientRect().right) : null;
      }),
      trunc: pills.slice(0, 5).map((p) => {
        const r = p.querySelector(".mpc-rest");
        return r.scrollWidth > r.clientWidth + 1;
      }),
    };
  });
  console.log(v, JSON.stringify(info));
  const el = await page.$(".deck-wrap");
  if (el) await el.screenshot({ path: `desk-${v}.png` });
  await ctx.close();
}
await browser.close();

// Compare two mobile rail strategies after the closed-info fix.
import { chromium } from "playwright";

const FIX = `.mpc:not(.open) .mpc-info { flex: 0 0 0; width: 0; max-width: 0; padding-inline: 0; overflow: hidden; }`;

const VARIANTS = {
  A_current: ``,
  B_maxcontent: `.deck-row { grid-auto-columns: max-content !important; }
                 .deck-row .mpc:not(.open) { width: 100% !important; }`,
  C_maxcontent_nostretch: `.deck-row { grid-auto-columns: max-content !important; }
                 .deck-row .mpc:not(.open) { width: 100% !important; }
                 .deck-row { padding-left: 2px; }`,
};

const browser = await chromium.launch();
for (const [vname, extra] of Object.entries(VARIANTS)) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto("https://mog-market.vercel.app/app?shot=1", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForSelector(".deck-row .mpc", { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(2200);
  await page.addStyleTag({ content: FIX + extra });
  await page.waitForTimeout(400);

  const closed = await page.evaluate(() => {
    const row = document.querySelector(".deck-row");
    const pills = [...row.querySelectorAll(".mpc")];
    return {
      rowW: Math.round(row.getBoundingClientRect().width),
      scrollW: row.scrollWidth,
      cols: getComputedStyle(row).gridTemplateColumns.slice(0, 60),
      widths: pills.slice(0, 4).map((p) => Math.round(p.getBoundingClientRect().width)),
      names: pills.slice(0, 4).map((p) => {
        const r = p.querySelector(".mpc-rest");
        return { t: (r.textContent||"").trim().slice(0,10), trunc: r.scrollWidth > r.clientWidth + 1 };
      }),
    };
  });
  await page.evaluate(() => document.querySelector(".deck-row .mpc").click());
  await page.waitForTimeout(900);
  const open = await page.evaluate(() => {
    const c = document.querySelector(".deck-row .mpc.open");
    const row = document.querySelector(".deck-row");
    const r = c.getBoundingClientRect(), rr = row.getBoundingClientRect();
    return { cardW: Math.round(r.width), cardH: Math.round(r.height),
             clipR: Math.max(0, Math.round(r.right - rr.right)), clipB: Math.max(0, Math.round(r.bottom - rr.bottom)),
             rowH: Math.round(rr.height) };
  });
  console.log(vname, "closed:", JSON.stringify(closed), "\n   open:", JSON.stringify(open));
  await page.screenshot({ path: `var-${vname}.png` });
  await ctx.close();
}
await browser.close();

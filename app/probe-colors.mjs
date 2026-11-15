// Dump the resolved theme + open-card colors and geometry at 390px.
import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.goto("https://mog-market.vercel.app/app?shot=1", { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForSelector(".deck-row .mpc", { timeout: 90000 }).catch(() => {});
await page.waitForTimeout(2500);
await page.evaluate(() => document.querySelector(".deck-row .mpc").click());
await page.waitForTimeout(1200);

const out = await page.evaluate(() => {
  const html = document.documentElement;
  const card = document.querySelector(".deck-row .mpc.open");
  const g = (sel) => {
    const el = card.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { color: cs.color, bg: cs.backgroundColor, opacity: cs.opacity, w: Math.round(r.width), h: Math.round(r.height) };
  };
  const cr = card.getBoundingClientRect();
  return {
    dataTheme: html.getAttribute("data-theme"),
    htmlClass: html.className,
    cardBg: getComputedStyle(card).backgroundColor,
    cardW: Math.round(cr.width), cardH: Math.round(cr.height),
    name: g(".mpc-name"), bio: g(".mpc-bio"), rank: g(".mpc-rank"), owner: g(".mpc-owner"),
    price: g(".mpc-price b"), info: g(".mpc-info"), face: g(".mpc-face"), go: g(".mpc-go"),
    rest: g(".mpc-rest"),
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();

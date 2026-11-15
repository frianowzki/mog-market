// Diagnose horizontal page overflow at mobile widths: who is wider than the viewport?
import { chromium } from "playwright";

const URL = "https://mog-market.vercel.app/app?shot=1";
const browser = await chromium.launch();
for (const w of [390, 820]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForSelector(".deck-row .mpc", { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const out = await page.evaluate(() => {
    const vw = window.innerWidth;
    const docW = document.documentElement.scrollWidth;
    const row = document.querySelector(".deck-row");
    const chain = [];
    let el = row;
    while (el && el !== document.documentElement) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      chain.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().slice(0, 46),
        w: Math.round(r.width),
        ov: cs.overflowX,
        display: cs.display,
        minW: cs.minWidth,
        cols: cs.gridTemplateColumns.slice(0, 60),
      });
      el = el.parentElement;
    }
    // widest offenders on the page
    const bad = [];
    document.querySelectorAll("body *").forEach((n) => {
      const r = n.getBoundingClientRect();
      if (r.right > vw + 2 && r.width > 0) {
        const cs = getComputedStyle(n);
        if (cs.position === "fixed") return;
        bad.push({ cls: (n.className || "").toString().slice(0, 40), tag: n.tagName.toLowerCase(), right: Math.round(r.right), w: Math.round(r.width) });
      }
    });
    return { vw, docW, chain, bad: bad.slice(0, 12) };
  });
  console.log(`--- viewport ${w} --- docW=${out.docW} vw=${out.vw} hOverflow=${out.docW - out.vw}`);
  out.chain.forEach((c) => console.log(`  ${c.tag}.${c.cls} w=${c.w} ovX=${c.ov} disp=${c.display} minW=${c.minW} cols=${c.cols}`));
  console.log("  offenders:", JSON.stringify(out.bad));
  await ctx.close();
}
await browser.close();

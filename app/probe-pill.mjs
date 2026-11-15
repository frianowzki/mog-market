// Measure the CLOSED pill internals at 390px: is the label truncating into free space?
import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto("https://mog-market.vercel.app/app?shot=1", { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForSelector(".deck-row .mpc", { timeout: 90000 }).catch(() => {});
await page.waitForTimeout(2500);

const out = await page.evaluate(() => {
  const pill = document.querySelector(".deck-row .mpc");
  const pr = pill.getBoundingClientRect();
  const cs = getComputedStyle(pill);
  const kids = [...pill.children].map((k) => {
    const r = k.getBoundingClientRect();
    const c = getComputedStyle(k);
    return {
      cls: k.className.toString(),
      w: Math.round(r.width), h: Math.round(r.height),
      x: Math.round(r.left - pr.left),
      flex: c.flex, minW: c.minWidth, maxW: c.maxWidth,
      overflow: c.overflow, textOverflow: c.textOverflow, whiteSpace: c.whiteSpace,
      display: c.display,
      text: (k.textContent || "").trim().slice(0, 20),
      scrollW: k.scrollWidth, clientW: k.clientWidth,
      padRight: c.paddingRight,
    };
  });
  return {
    pill: { w: Math.round(pr.width), h: Math.round(pr.height), display: cs.display, gap: cs.gap, pad: cs.padding, overflow: cs.overflow, position: cs.position },
    kids,
    inner: [...pill.querySelectorAll(".mpc-name, .mpc-info, .mpc-label, .mpc-rest, .mpc-face")].map((n) => {
      const r = n.getBoundingClientRect();
      return { cls: n.className.toString(), w: Math.round(r.width), h: Math.round(r.height), scrollW: n.scrollWidth, text: (n.textContent||"").trim().slice(0,24), cs: getComputedStyle(n).maxWidth };
    }),
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();

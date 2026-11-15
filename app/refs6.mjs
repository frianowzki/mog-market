import { chromium } from "playwright";
import fs from "node:fs";

const TARGETS = [
  ["morph", "https://grateful-encounter-200773.framer.app", "div[class*=card], a, h1, h2, h3, p, img"],
  ["footer", "https://liquid-glass-footer.framer.website", "footer, div[class*=footer], a, h1, h2, h3, p, svg"],
  ["gradients", "https://threegradients.framer.website", "canvas, div, section, h1, h2, p"],
  ["theme", "https://themechanger.framer.website", "div, button, h1, h2, p, label, input"],
  ["scroll", "https://scrollindicatorx.framer.website", "div, h1, h2, p, svg, path"],
];

const b = await chromium.launch({ channel: "chrome" });
for (const [name, url, sel] of TARGETS) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  try { await p.goto(url, { waitUntil: "networkidle", timeout: 55000 }); }
  catch { await p.goto(url, { waitUntil: "domcontentloaded", timeout: 55000 }); }
  await p.waitForTimeout(2600);
  await p.screenshot({ path: `r-${name}.png` });

  const data = await p.evaluate((sel) => {
    const out = [];
    document.querySelectorAll(sel).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 30 || r.height < 14) return;
      const cs = getComputedStyle(el);
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().slice(0, 70),
        text: (el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 70),
        box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(","),
        bg: cs.backgroundColor,
        bgi: cs.backgroundImage.slice(0, 90),
        radius: cs.borderRadius,
        filter: cs.filter.slice(0, 50),
        bf: cs.backdropFilter.slice(0, 40),
        shadow: cs.boxShadow.slice(0, 70),
        font: cs.fontSize + "/" + cs.fontWeight,
      });
    });
    const seen = new Set(); const u = [];
    for (const d of out) {
      const k = d.tag + d.text + d.box;
      if (seen.has(k)) continue; seen.add(k); u.push(d);
    }
    return u.slice(0, 90);
  }, sel);

  fs.writeFileSync(`r-${name}.json`, JSON.stringify(data, null, 0));
  console.log(name, data.length);
  await ctx.close();
}
await b.close();

import { chromium } from "playwright";

const b = await chromium.launch({ channel: "chrome" });

// ---- morph pill hover states
const c1 = await b.newContext({ viewport: { width: 1200, height: 800 } });
const p1 = await c1.newPage();
await p1.goto("https://grateful-encounter-200773.framer.app", { waitUntil: "networkidle", timeout: 60000 });
await p1.waitForTimeout(2500);
const pill = await p1.$("img");
const box = await pill.boundingBox();
console.log("pill box", JSON.stringify(box));
await p1.screenshot({ path: "m0.png", clip: { x: 380, y: 240, width: 460, height: 200 } });
await p1.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await p1.waitForTimeout(1200);
const hov = await p1.evaluate(() => {
  const img = document.querySelector("img");
  const wrap = img?.closest("div");
  const cs = wrap ? getComputedStyle(wrap) : null;
  return {
    wrapBox: wrap ? (() => { const r = wrap.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; })() : null,
    wrapRadius: cs?.borderRadius,
    wrapW: cs?.width,
    texts: [...document.querySelectorAll("p, span, button")].map((e) => e.innerText.trim()).filter(Boolean).slice(0, 10),
  };
});
console.log("on hover", JSON.stringify(hov));
await p1.screenshot({ path: "m1.png", clip: { x: 300, y: 200, width: 620, height: 280 } });
await c1.close();

// ---- gradient palette: sample real pixels
const c2 = await b.newContext({ viewport: { width: 1200, height: 700 } });
const p2 = await c2.newPage();
await p2.goto("https://threegradients.framer.website", { waitUntil: "networkidle", timeout: 60000 });
await p2.waitForTimeout(3000);
const px = await p2.evaluate(async () => {
  const cv = document.querySelector("canvas");
  if (!cv) return { canvas: false, bodyBg: getComputedStyle(document.body).backgroundImage.slice(0, 200) };
  return { canvas: true, w: cv.width, h: cv.height, style: getComputedStyle(cv).filter };
});
console.log("gradients", JSON.stringify(px));
const layers = await p2.evaluate(() =>
  [...document.querySelectorAll("div")].filter((d) => {
    const cs = getComputedStyle(d);
    return cs.backgroundImage.includes("gradient") || cs.filter.includes("blur");
  }).slice(0, 6).map((d) => ({
    bgi: getComputedStyle(d).backgroundImage.slice(0, 120),
    filter: getComputedStyle(d).filter,
    bg: getComputedStyle(d).backgroundColor,
    size: (() => { const r = d.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; })(),
  }))
);
console.log("layers", JSON.stringify(layers, null, 1).slice(0, 1500));
await c2.close();
await b.close();

// Identify the 404s and capture desktop + mobile shots.
import { chromium } from "playwright";

const browser = await chromium.launch();

async function run(name, w, h, tap) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const notFound = [];
  page.on("response", (r) => { if (r.status() === 404) notFound.push(r.url().slice(0, 110)); });
  await page.goto("https://mog-market.vercel.app/app?shot=1", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForSelector(".deck-row .mpc", { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(2500);
  if (tap) {
    await page.evaluate(() => document.querySelector(".deck-row .mpc").click());
    await page.waitForTimeout(1000);
    await page.evaluate(() => document.querySelector(".deck-wrap").scrollIntoView({ block: "center" }));
    await page.waitForTimeout(500);
  }
  const el = await page.$(".deck-wrap");
  if (el) await el.screenshot({ path: `v-${name}.png` });
  await page.screenshot({ path: `vp-${name}.png`, fullPage: false });
  console.log(name, "404s:", JSON.stringify([...new Set(notFound)]));
  await ctx.close();
}

await run("m390", 390, 844, true);
await run("m390closed", 390, 844, false);
await run("d1280", 1280, 900, true);
await browser.close();

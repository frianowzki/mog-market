import { chromium } from "../node_modules/playwright-core/index.mjs";

const URL = process.argv[2] || "http://localhost:4199/";
const b = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const p = await b.newPage({ viewport: { width: 1440, height: 980 } });

const errs = [];
p.on("pageerror", (e) => errs.push("pageerror: " + e.message));
p.on("console", (m) => {
  if (m.type() === "error") {
    const t = m.text();
    if (/Failed to load resource|favicon/i.test(t)) return;
    errs.push("console: " + t.slice(0, 180));
  }
});

await p.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForTimeout(15000);

const probe = await p.evaluate(() => {
  const txt = (sel) => document.querySelector(sel)?.textContent?.trim() ?? null;
  return {
    title: document.title,
    bodyText: document.body.innerText.slice(0, 600),
    hasRoot: Boolean(document.querySelector("#root")?.children.length),
    h2: txt("h2"),
    buttons: [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).slice(0, 6),
    inputs: document.querySelectorAll("input").length,
    overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
  };
});
console.log("PROBE:", JSON.stringify(probe, null, 1));
console.log("ERRORS:", errs.length ? errs.slice(0, 5) : "none");

await p.screenshot({ path: "app-desktop.png", fullPage: false });
await p.setViewportSize({ width: 390, height: 844 });
await p.waitForTimeout(700);
const mob = await p.evaluate(() => ({ overflowX: document.documentElement.scrollWidth > window.innerWidth + 1 }));
await p.screenshot({ path: "app-phone.png" });
console.log("MOBILE:", JSON.stringify(mob));

await b.close();

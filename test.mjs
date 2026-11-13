import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const srv = createServer((req, res) => {
  if (req.url === "/api/leaderboard") { res.setHeader("content-type","application/json"); res.end(readFileSync(join(ROOT,"api.json"),"utf8")); return; }
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.end(readFileSync(join(ROOT, "index.html")));
}).listen(0);
const url = `http://localhost:${srv.address().port}/`;

const b = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const p = await b.newPage({ viewport: { width: 1440, height: 980 } });
const errs = [];
p.on("pageerror", e => errs.push("pageerror: " + e.message));
p.on("console", m => { if (m.type() === "error" && !/404|Failed to load resource/.test(m.text())) errs.push("console: " + m.text()); });

await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(1800);

const boot = await p.evaluate(() => ({
  state: document.querySelector("#mktState").textContent,
  rows: document.querySelectorAll("tr.asset").length,
  nav: document.querySelector("#navBig").textContent,
  cash: document.querySelector("#sCash").textContent,
  snap: document.querySelector("#mktState").textContent,
  // price check: #1 should be $1,000.00
  firstPrice: document.querySelector("tr.asset .price")?.textContent,
  lastName: [...document.querySelectorAll("tr.asset .nm")].pop()?.textContent,
  lastPrice: [...document.querySelectorAll("tr.asset .price")].pop()?.textContent,
}));
console.log("boot:", JSON.stringify(boot));

// buy top asset 3x
for (let i = 0; i < 3; i++) {
  await p.evaluate(() => document.querySelector("tr.asset .buy").click());
  await p.waitForTimeout(120);
}
const afterBuy = await p.evaluate(() => ({
  cash: document.querySelector("#sCash").textContent,
  equity: document.querySelector("#sEquity").textContent,
  positions: document.querySelector("#sPos").textContent,
  navSub: document.querySelector("#navSub").textContent,
  holdings: [...document.querySelectorAll(".hold .nm")].map(n => n.textContent),
  sellEnabled: !document.querySelector("#sellBtn").disabled,
  copyEnabled: !document.querySelector("#copyBtn").disabled,
  ticket: document.querySelector("#oAmt").textContent,
}));
console.log("after buy 3x:", JSON.stringify(afterBuy));

// sanity: cash should be 1000 - 750 = 250, equity still 1000
if (!afterBuy.cash.includes("250.00")) errs.push("cash wrong: " + afterBuy.cash);
if (!afterBuy.equity.includes("1,000.00")) errs.push("equity wrong: " + afterBuy.equity);

// buy a mid-priced asset
await p.evaluate(() => {
  const rows = [...document.querySelectorAll("tr.asset")];
  rows[19].querySelector(".buy").click();   // rank 20
});
await p.waitForTimeout(200);
const afterSecond = await p.evaluate(() => ({
  cash: document.querySelector("#sCash").textContent,
  positions: document.querySelector("#sPos").textContent,
  equity: document.querySelector("#sEquity").textContent,
}));
console.log("after buy mid:", JSON.stringify(afterSecond));

// sell all first holding
await p.evaluate(() => {
  const rows = [...document.querySelectorAll("tr.asset")];
  rows[0].click();
});
await p.waitForTimeout(150);
await p.evaluate(() => document.querySelector("#sellBtn").click());
await p.waitForTimeout(250);
const afterSell = await p.evaluate(() => ({
  cash: document.querySelector("#sCash").textContent,
  positions: document.querySelector("#sPos").textContent,
  equity: document.querySelector("#sEquity").textContent,
  toast: document.querySelector("#toast").textContent,
}));
console.log("after sell:", JSON.stringify(afterSell));

// persistence
await p.reload({ waitUntil: "networkidle" });
await p.waitForTimeout(1500);
const persisted = await p.evaluate(() => ({
  positions: document.querySelector("#sPos").textContent,
  holdings: [...document.querySelectorAll(".hold .nm")].map(n => n.textContent),
}));
console.log("persisted:", JSON.stringify(persisted));
if (persisted.positions !== "1") errs.push("persistence failed: " + persisted.positions);

await p.screenshot({ path: join(ROOT, "shot-desktop.png") });
await p.screenshot({ path: join(ROOT, "shot-full.png"), fullPage: true });

// mobile
await p.setViewportSize({ width: 390, height: 844 });
await p.waitForTimeout(500);
const mob = await p.evaluate(() => ({
  overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
  sideBottom: Math.round(document.querySelector(".side").getBoundingClientRect().bottom),
  rows: document.querySelectorAll("tr.asset").length,
}));
await p.screenshot({ path: join(ROOT, "shot-phone.png") });
console.log("mobile:", JSON.stringify(mob));

console.log("errors:", errs.length ? errs : "none");
await b.close(); srv.close();
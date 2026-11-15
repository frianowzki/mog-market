import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const types = { ".html": "text/html", ".jsx": "text/babel", ".js": "text/javascript", ".css": "text/css" };

const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/proof.html";
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end("nf"); }
  res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 1000 }, deviceScaleFactor: 1.5 });
const errs = [];
p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
p.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));

await p.goto(`http://localhost:${port}/`, { waitUntil: "networkidle", timeout: 60000 });
await p.waitForTimeout(4500);

// did the React tree actually render?
const mounted = await p.evaluate(() => ({
  root: !!document.querySelector("#root > div, #root > .blk"),
  blocks: document.querySelectorAll(".blk").length,
  shareBtns: document.querySelectorAll(".ss-btn").length,
  glass: document.querySelectorAll(".lgb").length,
  ecCards: document.querySelectorAll(".ec-card").length,
  ecOpen: document.querySelectorAll(".ec-card.open").length,
  tickets: document.querySelectorAll(".tk").length,
  torn: document.querySelectorAll(".tk.is-torn").length,
  crestCards: document.querySelectorAll(".cg-card").length,
}));
console.log("MOUNT", JSON.stringify(mounted));
console.log("ERRS", errs.length ? errs.slice(0, 8).join("\n") : "none");

await p.screenshot({ path: "proof-full.png", fullPage: true });

// section shots
for (const [name, sel] of [["share", ".blk:nth-child(1)"], ["glass", ".blk:nth-child(2)"], ["expand", ".blk:nth-child(3)"], ["ticket", ".blk:nth-child(4)"], ["crest", ".blk:nth-child(5)"]]) {
  const el = await p.$(sel);
  if (el) await el.screenshot({ path: `proof-${name}.png` }).catch(() => {});
}

// interactions
await p.click(".ec-card:nth-child(3)");
await p.waitForTimeout(900);
const afterExpand = await p.evaluate(() => document.querySelector(".ec-card:nth-child(3)")?.className);
console.log("EXPAND_CLICK", afterExpand);

await b.close();
srv.close();

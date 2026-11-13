#!/usr/bin/env node
/**
 * Re-bakes the offline snapshot in index.html from the live Motion leaderboard.
 *
 *   node update-snapshot.mjs
 *
 * The page is a single file with the last known leaderboard embedded, so it stays
 * playable when the API is down, rate-limited, or the season ends. Running this
 * refreshes that fallback — it does not touch anything else.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const API = "https://leaderboard.motion.game/api/leaderboard";

const res = await fetch(API, { headers: { accept: "application/json" } });
if (!res.ok) throw new Error(`leaderboard API ${res.status}`);
const d = await res.json();
if (!Array.isArray(d.rows) || !d.rows.length) throw new Error("empty leaderboard payload");

const blob = JSON.stringify({ asOf: d.asOf, capturedAt: d.capturedAt, rows: d.rows });
const file = join(ROOT, "index.html");
const html = readFileSync(file, "utf8");
const at = html.indexOf("const BAKED = ");
const end = html.indexOf("};", at);
if (at < 0 || end < at) throw new Error("BAKED marker not found in index.html");

writeFileSync(file, html.slice(0, at) + "const BAKED = " + blob + ";" + html.slice(end + 2));
console.log(`baked ${d.rows.length} rows · asOf ${d.asOf} · ${(blob.length / 1024).toFixed(1)} KB`);

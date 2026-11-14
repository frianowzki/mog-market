#!/usr/bin/env node
/**
 * Sync the FULL live Motion leaderboard into MogMarketV2 on Fluent Testnet.
 *
 *   node sync-board.mjs --dry     # simulate only, no tx
 *   node sync-board.mjs           # broadcast
 *
 * syncBoard() is idempotent + onlyOwner: existing creators get rank/delta
 * refreshed, new ones get appended. Safe to re-run as the board changes.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createWalletClient, createPublicClient, http, keccak256, toBytes,
  encodeFunctionData, decodeAbiParameters,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DRY = process.argv.includes("--dry");

const CHAIN = {
  id: 20994,
  name: "Fluent Testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.fluent.xyz"] } },
  blockExplorers: { default: { name: "Fluentscan", url: "https://testnet.fluentscan.xyz" } },
};

const MARKET = process.env.VITE_CONTRACT_ADDRESS
  || readFileSync(join(ROOT, "app/.env"), "utf8").match(/VITE_CONTRACT_ADDRESS=(0x[0-9a-fA-F]+)/)[1];
const API = "https://leaderboard.motion.game/api/leaderboard";

const ABI = [
  { type: "function", name: "creatorCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "creatorIdAt", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "bytes32" }] },
  { type: "function", name: "creatorOf", stateMutability: "view", inputs: [{ type: "bytes32" }],
    outputs: [{ type: "tuple", components: [
      { name: "name", type: "string" }, { name: "rank", type: "uint16" },
      { name: "delta", type: "int16" }, { name: "exists", type: "bool" }] }] },
  { type: "function", name: "syncBoard", stateMutability: "nonpayable",
    inputs: [{ type: "bytes32[]" }, { type: "string[]" }, { type: "uint16[]" }, { type: "int16[]" }], outputs: [] },
];

const pk = process.env.FLUENT_DEPLOYER_KEY
  || JSON.parse(readFileSync(join(ROOT, ".fluent-deployer.json"), "utf8")).privateKey;
const account = privateKeyToAccount(pk.startsWith("0x") ? pk : "0x" + pk);
const pub = createPublicClient({ chain: CHAIN, transport: http() });
const wallet = createWalletClient({ account, chain: CHAIN, transport: http() });

console.log("market :", MARKET);
console.log("owner  :", account.address);

/* ---------- 1. live board ---------- */
async function fetchBoard() {
  // node's fetch is blocked by the CF edge on this host; curl gets through
  const { execFileSync } = await import("node:child_process");
  try {
    const res = await fetch(API, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`leaderboard API ${res.status}`);
    return await res.json();
  } catch (e) {
    console.log(`live fetch failed (${e.cause?.code || e.message}) → falling back to curl`);
    const out = execFileSync("curl", ["-sL", "--max-time", "30", "-H", "accept: application/json", API],
      { maxBuffer: 32 * 1024 * 1024, encoding: "utf8" });
    return JSON.parse(out);
  }
}
const board = await fetchBoard();
if (!Array.isArray(board.rows) || !board.rows.length) throw new Error("empty leaderboard payload");
const rows = board.rows
  .filter((r) => r.name && Number(r.position) > 0)
  .slice()
  .sort((a, b) => a.position - b.position);
console.log(`live   : ${rows.length} rows · asOf ${board.asOf}`);

/* ---------- 2. current on-chain state ---------- */
const n = Number(await pub.readContract({ address: MARKET, abi: ABI, functionName: "creatorCount" }));
const onchain = new Map();
for (let i = 0; i < n; i++) {
  const id = await pub.readContract({ address: MARKET, abi: ABI, functionName: "creatorIdAt", args: [BigInt(i)] });
  const c = await pub.readContract({ address: MARKET, abi: ABI, functionName: "creatorOf", args: [id] });
  if (c.exists && Number(c.rank) > 0) onchain.set(id.toLowerCase(), { name: c.name, rank: Number(c.rank), delta: Number(c.delta) });
}
console.log(`chain  : ${onchain.size} creators`);

/* ---------- 3. diff ---------- */
const ids = [], names = [], ranks = [], deltas = [];
const fresh = [], moved = [];
for (const r of rows) {
  const id = keccak256(toBytes(r.name));
  const cur = onchain.get(id.toLowerCase());
  const rank = Math.max(1, Math.min(65535, Number(r.position)));
  const delta = Math.max(-32768, Math.min(32767, Math.round(Number(r.delta) || 0)));
  if (!cur) { fresh.push(`${rank}. ${r.name}`); }
  else if (cur.rank !== rank || cur.delta !== delta) { moved.push(`${cur.name}: ${cur.rank}→${rank}`); }
  ids.push(id); names.push(r.name); ranks.push(rank); deltas.push(delta);
}
console.log(`\nnew    : ${fresh.length}${fresh.length ? " → " + fresh.join(" | ") : ""}`);
console.log(`changed: ${moved.length}${moved.length ? " → " + moved.slice(0, 8).join(", ") : ""}`);
if (!fresh.length && !moved.length) { console.log("\nalready in sync — nothing to do"); process.exit(0); }

/* ---------- 4. simulate, then (unless --dry) broadcast ---------- */
const data = encodeFunctionData({ abi: ABI, functionName: "syncBoard", args: [ids, names, ranks, deltas] });
await pub.call({ account, to: MARKET, data });   // reverts here without spending gas
console.log("\nsim    : ok");

if (DRY) { console.log("dry run — not broadcast"); process.exit(0); }

const hash = await wallet.writeContract({
  address: MARKET, abi: ABI, functionName: "syncBoard", args: [ids, names, ranks, deltas],
});
console.log(`tx     : ${hash}`);

const rc = await pub.waitForTransactionReceipt({ hash, timeout: 180_000 });
console.log(`status : ${rc.status} · gas ${rc.gasUsed}`);
if (rc.status !== "success") throw new Error("syncBoard reverted: " + hash);

const after = Number(await pub.readContract({ address: MARKET, abi: ABI, functionName: "creatorCount" }));
console.log(`\nchain now: ${after} creators  (${after - n} added)`);
console.log(`explorer : ${CHAIN.blockExplorers.default.url}/tx/${hash}`);

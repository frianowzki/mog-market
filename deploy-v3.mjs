#!/usr/bin/env node
/**
 * deploy-v3.mjs — FLUENT testnet token with a 1B cap, a cooldown faucet, and the
 * V2 market wired to it.
 *
 *   node deploy-v3.mjs [--topup 0.02] [--drip 5000] [--cooldown 43200]
 *
 * Design (as requested):
 *  - token  MogTokenV3: 1,000,000,000 FLUENT total supply, hard-capped.
 *  - faucet MogFaucetV3: 5,000 FLUENT per request, 12 h (43,200 s) cooldown.
 *  - market MogMarketV2: unchanged board (price = 1000 / rank), settled in FLUENT.
 *  - price   read from the mainnet FLUENT feed at deploy time, recorded in
 *            deployments.json so the app can display the real reference price.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createWalletClient, createPublicClient, http, parseEther, formatEther, keccak256, toBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const ROOT = dirname(fileURLToPath(import.meta.url));
const CHAIN = {
  id: 20994,
  name: "Fluent Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.fluent.xyz"] } },
  blockExplorers: { default: { name: "Fluentscan", url: "https://testnet.fluentscan.xyz" } },
  testnet: true,
};

const pk = process.env.FLUENT_DEPLOYER_KEY || JSON.parse(readFileSync(join(ROOT, ".fluent-deployer.json"), "utf8")).privateKey;
const account = privateKeyToAccount(pk);
const pub = createPublicClient({ chain: CHAIN, transport: http() });
const wallet = createWalletClient({ account, chain: CHAIN, transport: http() });
const EXPLORER = CHAIN.blockExplorers.default.url;

const flag = (k, d) => {
  const i = process.argv.indexOf("--" + k);
  return i > -1 ? process.argv[i + 1] : d;
};

const TOKEN_NAME = "Fluent";
const TOKEN_SYMBOL = "FLUENT";
const SUPPLY = parseEther("1000000000");            // 1B, hard cap in the token
const DRIP_ETH = parseEther("0.005");
const DRIP_FLUENT = parseEther(flag("drip", "5000"));
const COOLDOWN = BigInt(flag("cooldown", "43200"));  // 12 h
const TOPUP = parseEther(flag("topup", "0.02"));
const SEED_PRICE = parseEther(flag("seed-price", "5000"));

const art = (name) => JSON.parse(readFileSync(join(ROOT, "chain", "artifacts", `${name}.json`), "utf8"));

async function deploy(name, args) {
  const a = art(name);
  const hash = await wallet.deployContract({ abi: a.abi, bytecode: a.bytecode, args });
  const rc = await pub.waitForTransactionReceipt({ hash, timeout: 180_000 });
  if (rc.status !== "success") throw new Error(`${name} deploy reverted: ${EXPLORER}/tx/${hash}`);
  console.log(`  ${name} → ${rc.contractAddress}  (${EXPLORER}/tx/${hash})`);
  return { address: rc.contractAddress, hash, abi: a.abi, gas: rc.gasUsed };
}

/* ---- mainnet FLUENT reference price (real feed, not hardcoded) ---- */
async function mainnetPrice() {
  const out = { symbol: "BLEND", usd: null, source: null, at: new Date().toISOString() };
  try {
    const r = await fetch("https://api.dexscreener.com/tokens/v1/ethereum/0xd8A271974E8EdAE9D7b58e3370dc1669427503F4");
    const pairs = await r.json();
    const best = (Array.isArray(pairs) ? pairs : []).sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
    if (best?.priceUsd) {
      out.usd = Number(best.priceUsd);
      out.source = `dexscreener:${best.dexId}:${best.pairAddress}`;
    }
  } catch { /* fall through to CMC */ }
  if (!out.usd) {
    try {
      const r = await fetch("https://api.coinmarketcap.com/data-api/v3/cryptocurrency/market-pairs/latest?slug=fluent&convertId=2781&limit=5");
      const d = (await r.json()).data;
      const p = (d?.marketPairs || [])[0];
      if (p?.price) { out.usd = Number(p.price); out.source = `cmc:${p.exchangeName}`; }
    } catch { /* leave null */ }
  }
  return out;
}

const bal = await pub.getBalance({ address: account.address });
console.log("deployer:", account.address);
console.log("balance :", formatEther(bal), "ETH");
const need = TOPUP + parseEther("0.004");
if (bal < need) {
  console.error(`need ~${formatEther(need)} ETH (topup + gas), have ${formatEther(bal)} — lower --topup`);
  process.exit(2);
}

const depFile = join(ROOT, "chain", "deployments.json");
const deps = existsSync(depFile) ? JSON.parse(readFileSync(depFile, "utf8")) : {};
const slot = deps[CHAIN.id] || deps["20994"] || {};

let gasTotal = 0n;

console.log(`\n1/5 deploying ${TOKEN_SYMBOL} (1B cap) …`);
const token = await deploy("MogTokenV3", [TOKEN_NAME, TOKEN_SYMBOL, account.address, SUPPLY]);
gasTotal += token.gas;

console.log(`\n2/5 deploying faucet (${formatEther(DRIP_ETH)} ETH once + ${formatEther(DRIP_FLUENT)} FLUENT every ${Number(COOLDOWN) / 3600} h) …`);
const faucet = await deploy("MogFaucetV3", [token.address, DRIP_ETH, DRIP_FLUENT, COOLDOWN]);
gasTotal += faucet.gas;

console.log("\n3/5 moving the 1B supply into the faucet pool …");
const moveHash = await wallet.writeContract({
  address: token.address, abi: token.abi,
  functionName: "transfer", args: [faucet.address, SUPPLY],
});
const moveRc = await pub.waitForTransactionReceipt({ hash: moveHash, timeout: 180_000 });
if (moveRc.status !== "success") throw new Error("supply transfer failed: " + moveHash);
console.log("  status:", moveRc.status);
gasTotal += moveRc.gasUsed;

console.log(`\n4/5 funding the ETH pool with ${formatEther(TOPUP)} ETH …`);
const fundHash = await wallet.sendTransaction({ to: faucet.address, value: TOPUP });
const fundRc = await pub.waitForTransactionReceipt({ hash: fundHash, timeout: 180_000 });
console.log("  status:", fundRc.status);

console.log("\n5/5 deploying the FLUENT-settled market …");
const market = await deploy("MogMarketV2", [token.address]);
gasTotal += market.gas;

const apiPath = join(ROOT, "api.json");
const creators = existsSync(apiPath) ? JSON.parse(readFileSync(apiPath, "utf8")).rows : [];
const ids = creators.map((c) => keccak256(toBytes(c.name)));
const names = creators.map((c) => c.name);
const ranks = creators.map((c, i) => Number(c.position) || i + 1);
const deltas = creators.map((c) => Math.max(-32768, Math.min(32767, Math.round(Number(c.delta) || 0))));

if (ids.length) {
  console.log(`\nseeding ${ids.length} creators …`);
  const seedHash = await wallet.writeContract({
    address: market.address, abi: market.abi,
    functionName: "syncBoard", args: [ids, names, ranks, deltas],
  });
  const seedRc = await pub.waitForTransactionReceipt({ hash: seedHash, timeout: 180_000 });
  if (seedRc.status !== "success") throw new Error("syncBoard failed: " + seedHash);
  console.log("  seeded:", seedRc.status, `${EXPLORER}/tx/${seedHash}`);
  gasTotal += seedRc.gasUsed;
}

const price = await mainnetPrice();
const poolBal = await pub.readContract({ address: faucet.address, abi: faucet.abi, functionName: "poolBalance" });
const symbol = await pub.readContract({ address: token.address, abi: token.abi, functionName: "symbol" });
const supply = await pub.readContract({ address: token.address, abi: token.abi, functionName: "totalSupply" });

deps[CHAIN.id] = {
  ...slot,
  address: market.address,
  chainId: CHAIN.id,
  version: "v3",
  deployedAt: new Date().toISOString(),
  explorer: `${EXPLORER}/address/${market.address}`,
  token: token.address,
  faucet: faucet.address,
  tokenSymbol: symbol,
  tokenName: TOKEN_NAME,
  totalSupply: supply.toString(),
  dripEth: DRIP_ETH.toString(),
  dripToken: DRIP_FLUENT.toString(),
  cooldownSeconds: Number(COOLDOWN),
  basePriceFluent: SEED_PRICE.toString(),
  seededCreators: ids.length,
  mainnetPrice: price,
  v2: { address: slot.address, token: slot.token, faucet: slot.faucet },
};
writeFileSync(depFile, JSON.stringify(deps, null, 2));

console.log("\n--- ready ---");
console.log("token  :", `${EXPLORER}/address/${token.address}`, `(${symbol})`);
console.log("supply :", Number(supply) / 1e18, symbol, "(cap 1,000,000,000)");
console.log("faucet :", `${EXPLORER}/address/${faucet.address}`);
console.log("market :", `${EXPLORER}/address/${market.address}`);
console.log("pool   :", formatEther(poolBal), "ETH →", Math.floor(Number(poolBal) / Number(DRIP_ETH)), "first claims");
console.log("drip   :", formatEther(DRIP_FLUENT), symbol, "every", Number(COOLDOWN) / 3600, "h");
console.log("price  :", price.usd != null ? `$${price.usd}` : "unavailable", price.source || "");
console.log("gas    :", gasTotal.toString());

#!/usr/bin/env node
/** verify-v3.mjs — read every V3 fact back off chain and print one table. */
import { readFileSync } from "node:fs";
import { createPublicClient, http, formatEther } from "viem";

const deps = JSON.parse(readFileSync("chain/deployments.json", "utf8"))["20994"];
const pub = createPublicClient({ transport: http("https://rpc.testnet.fluent.xyz") });

const token = JSON.parse(readFileSync("chain/artifacts/MogTokenV3.json", "utf8")).abi;
const faucet = JSON.parse(readFileSync("chain/artifacts/MogFaucetV3.json", "utf8")).abi;
const market = JSON.parse(readFileSync("chain/artifacts/MogMarketV2.json", "utf8")).abi;

const r = (address, abi, fn, args = []) => pub.readContract({ address, abi, functionName: fn, args });

const [name, symbol, supply, cap, faucetTok, dripTok, cooldown, pause, pool, count, claimN] = await Promise.all([
  r(deps.token, token, "name"),
  r(deps.token, token, "symbol"),
  r(deps.token, token, "totalSupply"),
  r(deps.token, token, "MAX_SUPPLY"),
  r(deps.faucet, faucet, "tokenPoolBalance"),
  r(deps.faucet, faucet, "tokenDripAmount"),
  r(deps.faucet, faucet, "cooldown"),
  r(deps.faucet, faucet, "paused"),
  r(deps.faucet, faucet, "poolBalance"),
  r(deps.market, market, "creatorCount"),
  r(deps.faucet, faucet, "claimCount"),
]);

const rows = [
  ["token", deps.token],
  ["name/symbol", `${name} (${symbol})`],
  ["totalSupply", `${Number(supply) / 1e18} (cap ${Number(cap) / 1e18})`],
  ["faucet", deps.faucet],
  ["faucet token pool", Number(faucetTok) / 1e18],
  ["drip per request", `${Number(dripTok) / 1e18} FLUENT`],
  ["cooldown", `${Number(cooldown) / 3600} h`],
  ["paused", pause],
  ["faucet ETH pool", `${formatEther(pool)} ETH`],
  ["claimCount", String(claimN)],
  ["market", deps.market],
  ["creators seeded", String(count)],
  ["mainnet price", deps.mainnetPrice?.usd != null ? `$${deps.mainnetPrice.usd}` : "n/a"],
];
for (const [k, v] of rows) console.log(k.padEnd(18), v);

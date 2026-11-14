#!/usr/bin/env node
/**
 *    `rename` reverts: an owned deployed token cannot be re-symboled.
 * faucet and the FLUENT-settled market, seeds the board.
 *
 *   node deploy-fluent.mjs [--topup 0.05] [--seed-price 5000]
 *
 * Facts this script is built around (verified on chain before writing it):
 *  - the old token 0xd765…7b02 is owned by a plain ERC20 (0x2C69…DC16), so
 *    `rename` reverts However↦: an owned deployed token cannot be re-symboled.
 *  - Fluent exposes its native-coin ERC20 facade at 0x…00FC, but it has no
 *    `rename`/`mint` selector (code length 0), so it is not a usable game token.
 *  => the token must be redeployed with the right name at deploy time.
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
const DRIP_ETH = parseEther("0.005");
const DRIP_FLUENT = parseEther("5000");
const TOPUP = parseEther(flag("topup", "0.05"));
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

const bal = await pub.getBalance({ address: account.address });
console.log("deployer:", account.address);
console.log("balance :", formatEther(bal), "ETH");
const need = TOPUP + parseEther("0.01");
if (bal < need) {
  console.error(`need ~${formatEther(need)} ETH (topup + gas), have ${formatEther(bal)} — lower --topup`);
  process.exit(2);
}

const depFile = join(ROOT, "chain", "deployments.json");
const deps = existsSync(depFile) ? JSON.parse(readFileSync(depFile, "utf8")) : {};
const slot = deps[CHAIN.id] || {};

let gasTotal = 0n;

console.log(`\n1/5 deploying ${TOKEN_SYMBOL} token …`);
const token = await deploy("MogToken", [TOKEN_NAME, TOKEN_SYMBOL]);
gasTotal += token.gas;

console.log("\n2/5 deploying faucet (ETH + 5,000 FLUENT per wallet) …");
const faucet = await deploy("MogFaucet", [token.address, DRIP_ETH, DRIP_FLUENT]);
gasTotal += faucet.gas;

console.log("\n3/5 handing token mint rights to the faucet …");
const ownHash = await wallet.writeContract({
  address: token.address, abi: token.abi,
  functionName: "transferOwnership", args: [faucet.address],
});
const ownRc = await pub.waitForTransactionReceipt({ hash: ownHash, timeout: 180_000 });
console.log("  status:", ownRc.status);
gasTotal += ownRc.gasUsed;

console.log(`\n4/5 funding the ETH pool with ${formatEther(TOPUP)} ETH …`);
const fundHash = await wallet.sendTransaction({ to: faucet.address, value: TOPUP });
const fundRc = await pub.waitForTransactionReceipt({ hash: fundHash, timeout: 180_000 });
console.log("  status:", fundRc.status);

console.log("\n5/5 deploying the FLUENT-settled market …");
const market = await deploy("MogMarketV2", [token.address]);
gasTotal += market.gas;

// seed the board from api.json so creators exist with names + ranks
const apiPath = join(ROOT, "api.json");
const creators = existsSync(apiPath) ? JSON.parse(readFileSync(apiPath, "utf8")).rows.slice(0, 60) : [];
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

const poolBal = await pub.readContract({ address: faucet.address, abi: faucet.abi, functionName: "poolBalance" });
const symbol = await pub.readContract({ address: token.address, abi: token.abi, functionName: "symbol" });

deps[CHAIN.id] = {
  ...slot,
  // v1 kept for the record; v2 keys are what the app reads
  address: market.address,
  chainId: CHAIN.id,
  deployedAt: new Date().toISOString(),
  explorer: `${EXPLORER}/address/${market.address}`,
  token: token.address,
  faucet: faucet.address,
  tokenSymbol: symbol,
  tokenName: TOKEN_NAME,
  dripEth: DRIP_ETH.toString(),
  dripToken: DRIP_FLUENT.toString(),
  basePriceFluent: SEED_PRICE.toString(),
  seededCreators: ids.length,
  v1: { address: slot.address, token: slot.token, faucet: slot.faucet },
};
writeFileSync(depFile, JSON.stringify(deps, null, 2));

console.log("\n--- ready ---");
console.log("token  :", `${EXPLORER}/address/${token.address}`, `(${symbol})`);
console.log("faucet :", `${EXPLORER}/address/${faucet.address}`);
console.log("market :", `${EXPLORER}/address/${market.address}`);
console.log("pool   :", formatEther(poolBal), "ETH →", Math.floor(Number(poolBal) / Number(DRIP_ETH)), "claims");
console.log("drip   :", formatEther(DRIP_ETH), "ETH +", formatEther(DRIP_FLUENT), symbol, "per wallet");
console.log("gas    :", gasTotal.toString());

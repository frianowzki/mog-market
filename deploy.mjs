#!/usr/bin/env node
/**
 * Deploys MogMarket to Fluent Testnet and seeds the board from api.json.
 *
 *   node deploy.mjs            # deploy + seed
 *   node deploy.mjs --seed-only
 *
 * Key handling: reads FLUENT_DEPLOYER_KEY from env. Never prints it. If absent,
 * generates a fresh key, writes it to .fluent-deployer.json (gitignored), and
 * tells you to fund that address from the faucet.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createWalletClient, createPublicClient, http, keccak256, toHex } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";

const ROOT = dirname(fileURLToPath(import.meta.url));
const KEYFILE = join(ROOT, ".fluent-deployer.json");
const CHAIN = {
  id: 20994,
  name: "Fluent Testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.fluent.xyz"] } },
  blockExplorers: { default: { name: "Fluentscan", url: "https://testnet.fluentscan.xyz" } },
  testnet: true,
};

/* --------------------------------------------------------------- key setup */
let pk = process.env.FLUENT_DEPLOYER_KEY;
if (!pk && existsSync(KEYFILE)) pk = JSON.parse(readFileSync(KEYFILE, "utf8")).privateKey;
if (!pk) {
  pk = generatePrivateKey();
  writeFileSync(KEYFILE, JSON.stringify({ privateKey: pk, createdAt: new Date().toISOString() }, null, 2));
  console.log("generated new deployer key ->", KEYFILE);
}
const account = privateKeyToAccount(pk);

const pub = createPublicClient({ chain: CHAIN, transport: http() });
const wallet = createWalletClient({ account, chain: CHAIN, transport: http() });

const balance = await pub.getBalance({ address: account.address });
console.log("deployer:", account.address);
console.log("balance :", (Number(balance) / 1e18).toFixed(6), "ETH");

if (balance === 0n) {
  console.error("\nNo gas. Fund this address first:");
  console.error("  address:", account.address);
  console.error("  faucet : https://testnet.fluent.xyz/faucet");
  process.exit(2);
}

/* ---------------------------------------------------------------- artifacts */
const artifact = JSON.parse(readFileSync(join(ROOT, "chain", "artifacts", "MogMarket.json"), "utf8"));
const deploysFile = join(ROOT, "chain", "deployments.json");
const existing = existsSync(deploysFile) ? JSON.parse(readFileSync(deploysFile, "utf8")) : {};

const seedOnly = process.argv.includes("--seed-only");
let address = existing[CHAIN.id]?.address;

if (!seedOnly) {
  console.log("\ndeploying MogMarket …");
  const hash = await wallet.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [],
  });
  console.log("  tx:", CHAIN.blockExplorers.default.url + "/tx/" + hash);
  const receipt = await pub.waitForTransactionReceipt({ hash, timeout: 120_000 });
  address = receipt.contractAddress;
  console.log("  contract:", address);
  console.log("  block   :", receipt.blockNumber.toString());
  if (receipt.status !== "success") throw new Error("deploy reverted");

  existing[CHAIN.id] = {
    address,
    chainId: CHAIN.id,
    deployedAt: new Date().toISOString(),
    txHash: hash,
    deployer: account.address,
    explorer: `${CHAIN.blockExplorers.default.url}/address/${address}`,
  };
  writeFileSync(deploysFile, JSON.stringify(existing, null, 2));
} else {
  if (!address) throw new Error("no deployment found; run without --seed-only first");
  console.log("seeding existing deployment", address);
}

/* ------------------------------------------------------------------- seeding */
const board = JSON.parse(readFileSync(join(ROOT, "api.json"), "utf8"));
const rows = board.rows.slice(0, 100); // keep the tx well under block gas limits
const ids = rows.map(r => keccak256(toHex(r.name)));
const names = rows.map(r => r.name);
const ranks = rows.map(r => r.position);
const deltas = rows.map(r => r.delta ?? 0);

console.log(`\nseeding ${rows.length} creators …`);
const seedHash = await wallet.writeContract({
  address,
  abi: artifact.abi,
  functionName: "syncBoard",
  args: [ids, names, ranks, deltas],
});
console.log("  tx:", CHAIN.blockExplorers.default.url + "/tx/" + seedHash);
const seedRc = await pub.waitForTransactionReceipt({ hash: seedHash, timeout: 120_000 });
console.log("  status:", seedRc.status, "block", seedRc.blockNumber.toString());

const count = await pub.readContract({ address, abi: artifact.abi, functionName: "creatorCount" });
console.log("  creators onchain:", count.toString());
console.log("\ndone →", `${CHAIN.blockExplorers.default.url}/address/${address}`);

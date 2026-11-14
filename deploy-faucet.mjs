#!/usr/bin/env node
/**
 * Deploys MogToken + MogFaucet on Fluent Testnet, funds the pool from the
 * deployer, and hands token mint rights to the faucet.
 *
 *   node deploy-faucet.mjs --topup 0.02   # also send 0.02 ETH to the pool
 *
 * Drip defaults: 0.005 ETH + 1000 MOG per address, one claim each.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createWalletClient, createPublicClient, http, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const ROOT = dirname(fileURLToPath(import.meta.url));
const KEYFILE = join(ROOT, ".fluent-deployer.json");
const CHAIN = {
  id: 20994,
  name: "Fluent Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.fluent.xyz"] } },
  blockExplorers: { default: { name: "Fluentscan", url: "https://testnet.fluentscan.xyz" } },
  testnet: true,
};

const pk = process.env.FLUENT_DEPLOYER_KEY || JSON.parse(readFileSync(KEYFILE, "utf8")).privateKey;
const account = privateKeyToAccount(pk);
const pub = createPublicClient({ chain: CHAIN, transport: http() });
const wallet = createWalletClient({ account, chain: CHAIN, transport: http() });
const EXPLORER = CHAIN.blockExplorers.default.url;

const bal = await pub.getBalance({ address: account.address });
console.log("deployer:", account.address);
console.log("balance :", formatEther(bal), "ETH");
if (bal === 0n) {
  console.error("no gas — fund the deployer first");
  process.exit(2);
}

const art = (name) =>
  JSON.parse(readFileSync(join(ROOT, "chain", "artifacts", `${name}.json`), "utf8"));

const depFile = join(ROOT, "chain", "deployments.json");
const deps = existsSync(depFile) ? JSON.parse(readFileSync(depFile, "utf8")) : {};
const slot = deps[CHAIN.id] || {};

// symbol matches the chain's own gas token so there is one unit system
const TOKEN_NAME = "Mog Market";
const TOKEN_SYMBOL = "ETH";
const DRIP_ETH = parseEther("0.005");
const DRIP_TOKEN = parseEther("1000");

async function deploy(name, args) {
  const a = art(name);
  const hash = await wallet.deployContract({ abi: a.abi, bytecode: a.bytecode, args });
  process.stdout.write(`  ${name} tx ${EXPLORER}/tx/${hash}\n`);
  const rc = await pub.waitForTransactionReceipt({ hash, timeout: 120_000 });
  if (rc.status !== "success") throw new Error(`${name} deploy reverted`);
  console.log(`  ${name} → ${rc.contractAddress}`);
  return { address: rc.contractAddress, hash, abi: a.abi };
}

console.log("\ndeploying token …");
const token = await deploy("MogToken", [TOKEN_NAME, TOKEN_SYMBOL]);

console.log("\ndeploying faucet …");
const faucet = await deploy("MogFaucet", [token.address, DRIP_ETH, DRIP_TOKEN]);

// faucet needs mint rights; token owner is the deployer until this lands
console.log("\nhanding mint rights to faucet …");
const ownHash = await wallet.writeContract({
  address: token.address,
  abi: token.abi,
  functionName: "transferOwnership",
  args: [faucet.address],
});
const ownRc = await pub.waitForTransactionReceipt({ hash: ownHash, timeout: 120_000 });
console.log("  status:", ownRc.status);

// top up the pool
const topupIdx = process.argv.indexOf("--topup");
const topup = topupIdx > -1 ? parseEther(process.argv[topupIdx + 1]) : parseEther("0.03");
console.log(`\nfunding pool with ${formatEther(topup)} ETH …`);
const fundHash = await wallet.sendTransaction({ to: faucet.address, value: topup });
const fundRc = await pub.waitForTransactionReceipt({ hash: fundHash, timeout: 120_000 });

const poolBal = await pub.readContract({
  address: faucet.address,
  abi: faucet.abi,
  functionName: "poolBalance",
});
const claimsLeft = Number(poolBal) / Number(DRIP_ETH);

deps[CHAIN.id] = {
  ...slot,
  token: token.address,
  faucet: faucet.address,
  tokenSymbol: TOKEN_SYMBOL,
  dripEth: DRIP_ETH.toString(),
  dripToken: DRIP_TOKEN.toString(),
  deployedAt: new Date().toISOString(),
};
writeFileSync(depFile, JSON.stringify(deps, null, 2));

console.log("\n--- ready ---");
console.log("token  :", `${EXPLORER}/address/${token.address}`, `(${TOKEN_SYMBOL})`);
console.log("faucet :", `${EXPLORER}/address/${faucet.address}`);
console.log("pool   :", formatEther(poolBal), "ETH  →", Math.floor(claimsLeft), "claims available");
console.log("drip   :", formatEther(DRIP_ETH), "ETH +", formatEther(DRIP_TOKEN), TOKEN_SYMBOL, "per address");

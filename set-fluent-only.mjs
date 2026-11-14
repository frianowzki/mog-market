#!/usr/bin/env node
/** set-fluent-only.mjs — make the deployed faucet FLUENT-only (no ETH drip). */
import { readFileSync } from "node:fs";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const CHAIN = {
  id: 20994, name: "Fluent Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.fluent.xyz"] } },
};

const pk = process.env.FLUENT_DEPLOYER_KEY || JSON.parse(readFileSync(".fluent-deployer.json", "utf8")).privateKey;
const account = privateKeyToAccount(pk);
const wallet = createWalletClient({ account, chain: CHAIN, transport: http() });
const pub = createPublicClient({ chain: CHAIN, transport: http() });

const d = JSON.parse(readFileSync("chain/deployments.json", "utf8"))["20994"];
const abi = JSON.parse(readFileSync("chain/artifacts/MogFaucetV3.json", "utf8")).abi;

const before = await pub.readContract({ address: d.faucet, abi, functionName: "dripAmount" });
console.log("dripAmount before:", before.toString());

const hash = await wallet.writeContract({
  address: d.faucet, abi, functionName: "setDrip",
  args: [0n, BigInt(d.dripToken), BigInt(d.cooldownSeconds)],
});
const rc = await pub.waitForTransactionReceipt({ hash, timeout: 180_000 });
console.log("setDrip status:", rc.status, "tx:", hash);

const after = await pub.readContract({ address: d.faucet, abi, functionName: "dripAmount" });
const tok = await pub.readContract({ address: d.faucet, abi, functionName: "tokenDripAmount" });
const cd = await pub.readContract({ address: d.faucet, abi, functionName: "cooldown" });
console.log("dripAmount after:", after.toString());
console.log("tokenDripAmount:", Number(tok) / 1e18, "FLUENT every", Number(cd) / 3600, "h");

#!/usr/bin/env node
/** End-to-end faucet test: claims from a throwaway wallet and asserts the drip lands. */
import { readFileSync } from "node:fs";
import { createWalletClient, createPublicClient, http, formatEther } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const RPC = "https://rpc.testnet.fluent.xyz";
const deps = JSON.parse(readFileSync("./chain/deployments.json", "utf8"))["20994"];
const FAUCET_ABI = JSON.parse(readFileSync("./chain/artifacts/MogFaucet.json", "utf8")).abi;
const TOKEN_ABI = JSON.parse(readFileSync("./chain/artifacts/MogToken.json", "utf8")).abi;

const pub = createPublicClient({ transport: http(RPC) });

const user = privateKeyToAccount(generatePrivateKey());
const w = createWalletClient({ account: user, transport: http(RPC) });

// A brand-new wallet has no gas, so the pool can't be claimed by it directly.
// Seed a hair of ETH from the deployer to prove the claim path, then assert it.
const deployer = privateKeyToAccount(
  JSON.parse(readFileSync("./.fluent-deployer.json", "utf8")).privateKey
);
const dw = createWalletClient({ account: deployer, transport: http(RPC) });
const seed = await dw.sendTransaction({ to: user.address, value: 200000000000000n }); // 0.0002 ETH gas
await pub.waitForTransactionReceipt({ hash: seed, timeout: 120_000 });
console.log("seeded gas :", "0.0002 ETH");

console.log("test wallet:", user.address);
console.log("faucet     :", deps.faucet);

const canBefore = await pub.readContract({
  address: deps.faucet, abi: FAUCET_ABI, functionName: "canClaim", args: [user.address],
});
console.log("canClaim (before):", canBefore);

const balBefore = await pub.getBalance({ address: user.address });
const tokBefore = await pub.readContract({
  address: deps.token, abi: TOKEN_ABI, functionName: "balanceOf", args: [user.address],
});
console.log("eth before:", formatEther(balBefore), "| token before:", formatEther(tokBefore));

console.log("\nclaiming …");
const hash = await w.writeContract({
  address: deps.faucet, abi: FAUCET_ABI, functionName: "claim", args: [],
});
const rc = await pub.waitForTransactionReceipt({ hash, timeout: 120_000 });
console.log("claim tx:", hash, "status:", rc.status, "block", rc.blockNumber.toString());

const balAfter = await pub.getBalance({ address: user.address });
const tokAfter = await pub.readContract({
  address: deps.token, abi: TOKEN_ABI, functionName: "balanceOf", args: [user.address],
});
const canAfter = await pub.readContract({
  address: deps.faucet, abi: FAUCET_ABI, functionName: "canClaim", args: [user.address],
});

console.log("eth after :", formatEther(balAfter), "(+ " + formatEther(balAfter - balBefore) + ")");
console.log("token after:", formatEther(tokAfter), "(+ " + formatEther(tokAfter - tokBefore) + ")");
console.log("canClaim (after):", canAfter);

// double-claim must revert with AlreadyClaimed
let blocked = "NOT BLOCKED";
try {
  await pub.simulateContract({
    address: deps.faucet, abi: FAUCET_ABI, functionName: "claim", args: [], account: user,
  });
} catch (e) {
  blocked = (e.shortMessage || e.message || "").slice(0, 90);
}
console.log("second claim  :", blocked);

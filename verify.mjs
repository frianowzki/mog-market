import { readFileSync } from "node:fs";
import { createPublicClient, http, keccak256, toHex, formatEther } from "viem";

const A = JSON.parse(readFileSync("./chain/artifacts/MogMarket.json", "utf8"));
const dep = JSON.parse(readFileSync("./chain/deployments.json", "utf8"));
const address = dep["20994"].address;
const pub = createPublicClient({ transport: http("https://rpc.testnet.fluent.xyz") });
const call = (functionName, args = []) =>
  pub.readContract({ address, abi: A.abi, functionName, args });

console.log("contract:", address);
const [count, snap, owner, last] = await Promise.all([
  call("creatorCount"),
  call("snapshotCount"),
  call("owner"),
  call("lastSnapshotAt"),
]);
console.log("creatorCount   :", count.toString());
console.log("snapshotCount  :", snap.toString());
console.log("owner          :", owner);
console.log("lastSnapshotAt :", new Date(Number(last) * 1000).toISOString());

// spot-check the top 3 by rank
for (const name of ["Druski", "Marques Brownlee", "IShowSpeed"]) {
  const id = keccak256(toHex(name));
  const [meta, price] = await Promise.all([call("creatorOf", [id]), call("priceOf", [id])]);
  console.log(
    `  #${meta.rank} ${meta.name.padEnd(20)} price $${Number(formatEther(price)).toFixed(2)} delta ${meta.delta}`
  );
}

// cheapest and most expensive
const ids = await Promise.all(
  Array.from({ length: Number(count) }, (_, i) => call("creatorIdAt", [BigInt(i)]))
);
const metas = await Promise.all(ids.map((id) => call("creatorOf", [id])));
const sorted = metas.map((m, i) => ({ ...m, id: ids[i] })).sort((a, b) => a.rank - b.rank);
const first = sorted[0], lastR = sorted[sorted.length - 1];
console.log(
  `  top: #${first.rank} ${first.name} $${Number(formatEther(await call("priceOf", [first.id]))).toFixed(2)}`
);
console.log(
  `  bottom: #${lastR.rank} ${lastR.name} $${Number(formatEther(await call("priceOf", [lastR.id]))).toFixed(2)}`
);

// equity for an address that never enrolled — must be 0
const dead = "0x000000000000000000000000000000000000dEaD";
const eq = await call("equityOf", [dead]);
const en = await call("enrolled", [dead]);
console.log("cold wallet enrolled:", en, "| equity:", formatEther(eq));

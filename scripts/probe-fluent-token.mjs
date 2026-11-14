import { createPublicClient, http } from "viem";
import { fluentTestnet } from "../app/src/chain.js";

let client;
const pub = () => (client ??= createPublicClient({ chain: fluentTestnet, transport: http("https://rpc.testnet.fluent.xyz") }));

const ERC20 = [
  { type: "function", name: "name", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "rename", stateMutability: "nonpayable", inputs: [{ name: "nextName", type: "string" }, { name: "nextSymbol", type: "string" }], outputs: [] },
  { type: "function", name: "mint", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [] },
  { type: "event", name: "Renamed", inputs: [{ name: "name", type: "string", indexed: false }, { name: "symbol", type: "string", indexed: false }] },
];

const arg = (k, d) => {
  const i = process.argv.indexOf("--" + k);
  return i > -1 ? process.argv[i + 1] : d;
};

const rpc = (method, params = []) =>
  fetch("https://rpc.testnet.fluent.xyz", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  }).then((r) => r.json());

const tokenAddr = arg("token", "0xd765aca9cf77995066da638656909f9dc7267b02");
const commission = "0x00000000000000000000000000000000000000fc";
const TOKEN = "0xd765aca9cf77995066da638656909f9dc7267b02";
const OLD_FAUCET = "0xd95cfc246cbf4ad17e1dfb43c089002226ee3cc0";

const step = process.argv[2] || "read";

async function read() {
  const p = pub();
  const [name, symbol, decimals, owner, supply, code] = await Promise.all([
    p.readContract({ address: tokenAddr, abi: ERC20, functionName: "name" }),
    p.readContract({ address: tokenAddr, abi: ERC20, functionName: "symbol" }),
    p.readContract({ address: tokenAddr, abi: ERC20, functionName: "decimals" }),
    p.readContract({ address: tokenAddr, abi: ERC20, functionName: "owner" }),
    p.readContract({ address: tokenAddr, abi: ERC20, functionName: "totalSupply" }),
    p.getBytecode({ address: tokenAddr }),
  ]);
  console.log(JSON.stringify({ tokenAddr, name, symbol, decimals, owner, supply: supply.toString(), hasCode: !!code && code !== "0x" }, null, 1));
  // is this Fluent's system token (native-erc20 precompile) or a plain deployed ERC20?
  const native = await rpc("eth_call", [{ to: TOKEN, data: "0x06fdde03" }, "latest"]);
  console.log("raw eth_call name:", JSON.stringify(native).slice(0, 200));
  const fc = await rpc("eth_getCode", [commission, "latest"]);
  console.log("fc precompile code len:", (fc.result || "0x").length);
}

async function checkOwner() {
  const p = pub();
  const owner = await p.readContract({ address: tokenAddr, abi: ERC20, functionName: "owner" });
  console.log("owner:", owner);
  const code = await rpc("eth_getCode", [owner, "latest"]);
  console.log("owner has code:", (code.result || "0x").length > 2, "len", (code.result || "0x").length);
}

async function simRename() {
  const p = pub();
  const from = "0xB7c769ACfE50DB37D3E1817BaCe51e9a555aBC33";
  try {
    const { result } = await p.simulateContract({
      address: tokenAddr, abi: ERC20, functionName: "rename",
      args: ["Fluent", "FLUENT"], account: from,
    });
    console.log("rename SIM OK:", result);
  } catch (e) {
    console.log("rename SIM FAIL:", (e.shortMessage || e.message || "").slice(0, 300));
    console.log("details:", JSON.stringify(e.metaMessages || e.cause?.data || null).slice(0, 300));
  }
}

async function simMarketBuy() {
  const p = pub();
  const market = arg("market");
  const id = arg("id");
  const abi = [{ type: "function", name: "buy", stateMutability: "payable", inputs: [{ name: "id", type: "bytes32" }, { name: "units", type: "uint256" }], outputs: [] }];
  try {
    const { result } = await p.simulateContract({ address: market, abi, functionName: "buy", args: [id, 1n], account: "0xB7c769ACfE50DB37D3E1817BaCe51e9a555aBC33" });
    console.log("buy sim OK", result);
  } catch (e) { console.log("buy sim:", (e.shortMessage || e.message || "").slice(0, 200)); }
}

const run = { read, checkOwner, simRename, simMarketBuy }[step];
if (!run) { console.error("unknown step"); process.exit(1); }
await run();

/**
 * Gasless faucet relayer — Vercel serverless function.
 *
 * A freshly-created Privy wallet holds 0 ETH, so it cannot pay for its own
 * `claim()` tx. This endpoint lets the server (which holds the faucet owner
 * key) call `claimFor(account)`, with the drip landing on the player.
 *
 * Safety:
 *  - rate limited per IP and the onchain `claimed` flag is the real guard
 *  - the owner key never leaves the server; only a tx hash goes back
 *  - refuses when the pool is empty so we never burn gas on a doomed call
 */
import { createWalletClient, createPublicClient, http, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC = "https://rpc.testnet.fluent.xyz";
const FAUCET = process.env.VITE_FAUCET_ADDRESS || "0xd95cfc246cbf4ad17e1dfb43c089002226ee3cc0";

const FAUCET_ABI = [
  { type: "function", name: "claimFor", inputs: [{ name: "account", type: "address" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "canClaim", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "bool" }], stateMutability: "view" },
  { type: "function", name: "claimed", inputs: [{ name: "", type: "address" }], outputs: [{ type: "bool" }], stateMutability: "view" },
  { type: "function", name: "poolBalance", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
];

// crude in-memory throttle — serverless instances are reused, so this catches
// the obvious hammering even though it is not a global guarantee
const hits = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;

function throttled(key) {
  const now = Date.now();
  const rec = hits.get(key) || { count: 0, reset: now + WINDOW_MS };
  if (now > rec.reset) {
    rec.count = 0;
    rec.reset = now + WINDOW_MS;
  }
  rec.count += 1;
  hits.set(key, rec);
  return rec.count > MAX_PER_WINDOW;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "bad json" }); }
  }
  const account = body?.account;
  if (!account || !isAddress(account)) return res.status(400).json({ error: "invalid account" });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (throttled(ip + ":" + account.toLowerCase())) {
    return res.status(429).json({ error: "slow down — try again in a minute" });
  }

  const raw = process.env.FAUCET_OWNER_KEY;
  if (!raw) return res.status(500).json({ error: "relayer key not configured" });

  try {
    const owner = privateKeyToAccount(raw.startsWith("0x") ? raw : "0x" + raw);
    const pub = createPublicClient({ transport: http(RPC) });
    const wallet = createWalletClient({ account: owner, transport: http(RPC) });

    const [already, can] = await Promise.all([
      pub.readContract({ address: FAUCET, abi: FAUCET_ABI, functionName: "claimed", args: [account] }).catch(() => false),
      pub.readContract({ address: FAUCET, abi: FAUCET_ABI, functionName: "canClaim", args: [account] }).catch(() => false),
    ]);

    if (already) return res.status(409).json({ error: "this address already claimed" });
    if (!can) return res.status(503).json({ error: "faucet pool is empty right now" });

    const hash = await wallet.writeContract({
      address: FAUCET,
      abi: FAUCET_ABI,
      functionName: "claimFor",
      args: [account],
    });
    const receipt = await pub.waitForTransactionReceipt({ hash, timeout: 90_000 });

    return res.status(200).json({
      ok: receipt.status === "success",
      hash,
      block: receipt.blockNumber.toString(),
      explorer: `https://testnet.fluentscan.xyz/tx/${hash}`,
    });
  } catch (e) {
    const msg = e.shortMessage || e.message || "relay failed";
    // surface the onchain reason when it is the useful part
    const friendly = /AlreadyClaimed/.test(msg)
      ? "this address already claimed"
      : /EmptyPool/.test(msg)
      ? "faucet pool is empty right now"
      : msg.slice(0, 160);
    return res.status(500).json({ error: friendly });
  }
}

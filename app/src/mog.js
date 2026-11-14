import { useState, useEffect, useCallback } from "react";
import { usePublicClient, useWalletClient, useReadContract } from "wagmi";
import { keccak256, toHex, formatEther, parseEther } from "viem";
import artifact from "./MogMarket.json";
import faucetArtifact from "./MogFaucetV3.json";
import { EXPLORER } from "./chain.js";

const ABI = artifact.abi;
const FAUCET_ABI = faucetArtifact.abi;

const ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || "").trim();
const FAUCET = (import.meta.env.VITE_FAUCET_ADDRESS || "").trim();
const TOKEN = (import.meta.env.VITE_TOKEN_ADDRESS || "").trim();

/* Official Fluent testnet faucet (ETH for gas). Our contract only drips FLUENT. */
export const GAS_FAUCET_URL = "https://portal.fluent.xyz/builder/faucet";

/* Mainnet FLUENT reference price (snapshot from deploy-v3.mjs, live-refreshed). */
export const FALLBACK_FLUENT_USD = Number(import.meta.env.VITE_FLUENT_USD || "") || 0.0476;

const ERC20 = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "a", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "o", type: "address" }, { name: "s", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "s", type: "address" }, { name: "v", type: "uint256" }], outputs: [{ type: "bool" }] },
];

/* FLUENT is 18-decimal. Show token units, plus a USD line at the live rate. */
const fmt = (wei, digits = 2) => {
  const n = Number(formatEther(wei ?? 0n));
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return n.toFixed(digits);
};
const idOf = (name) => keccak256(toHex(name));

export const BASE_PRICE = 1000n * 10n ** 18n;
export const priceOf = (rank) => (rank > 0 ? BASE_PRICE / BigInt(rank) : 0n);

/* ---------- Motion leaderboard: display names + profile pictures ----------
   The on-chain struct only stores name/rank/delta, so identity art comes from
   the public Motion feed. Creator uuid is NOT derivable from the on-chain id
   (that's keccak256(name)), so we key the feed by lowercased name. */

const MOTION_API = "https://leaderboard.motion.game/api/leaderboard";
export const PFP_URL = (uuid) => `https://leaderboard.motion.game/pfp/${uuid}.jpg`;

export function useMotionMeta() {
  const [meta, setMeta] = useState({});   // lowercase name -> { uuid, name, position }
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(MOTION_API, { headers: { accept: "application/json" } });
        if (!r.ok) return;
        const d = await r.json();
        if (!alive || !Array.isArray(d.rows)) return;
        const next = {};
        for (const row of d.rows) {
          if (!row?.name) continue;
          next[row.name.trim().toLowerCase()] = {
            uuid: row.id, name: row.name, position: Number(row.position) || 0,
          };
        }
        setMeta(next);
      } catch { /* offline / blocked → initials fallback */ }
    })();
    return () => { alive = false; };
  }, []);
  return meta;
}


export function useFluentPrice() {
  const [usd, setUsd] = useState(FALLBACK_FLUENT_USD);
  const [source, setSource] = useState("deploy snapshot");
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const r = await fetch("https://api.dexscreener.com/tokens/v1/ethereum/0xd8A271974E8EdAE9D7b58e3370dc1669427503F4");
        const pairs = await r.json();
        const best = (Array.isArray(pairs) ? pairs : []).sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
        if (live && best?.priceUsd) { setUsd(Number(best.priceUsd)); setSource("mainnet · dexscreener"); }
      } catch { /* keep snapshot */ }
    })();
    return () => { live = false; };
  }, []);
  return { usd, source };
}

/* ---------- board ---------- */

export function useBoard() {
  const pub = usePublicClient();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!ADDRESS || !pub) { setLoading(false); return; }
    try {
      setError(null);
      const count = await pub.readContract({ address: ADDRESS, abi: ABI, functionName: "creatorCount" });
      const n = Number(count);
      if (!n) { setRows([]); setLoading(false); return; }

      const ids = await Promise.all(
        Array.from({ length: n }, (_, i) =>
          pub.readContract({ address: ADDRESS, abi: ABI, functionName: "creatorIdAt", args: [BigInt(i)] })
        )
      );
      const metas = await Promise.all(
        ids.map((id) => pub.readContract({ address: ADDRESS, abi: ABI, functionName: "creatorOf", args: [id] }))
      );
      const out = ids.map((id, i) => {
        const m = metas[i];
        return { id, name: m.name, position: Number(m.rank), delta: Number(m.delta), exists: m.exists };
      }).filter((r) => r.exists && r.position > 0);
      out.sort((a, b) => a.position - b.position);
      setRows(out);
    } catch (e) {
      setError(e.shortMessage || e.message || "board read failed");
    } finally {
      setLoading(false);
    }
  }, [pub]);

  useEffect(() => { load(); }, [load]);
  return { rows, loading, error, reload: load };
}

/* ---------- wallet: FLUENT balance + faucet (5k / 12 h) ---------- */

export function useFluent(walletAddress) {
  const pub = usePublicClient();
  const { data: wallet } = useWalletClient();
  const [busy, setBusy] = useState(false);
  const [txError, setTxError] = useState(null);
  const [lastTx, setLastTx] = useState(null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 15_000);
    return () => clearInterval(t);
  }, []);

  const hasWallet = Boolean(walletAddress);
  const hasFaucet = Boolean(FAUCET && walletAddress);

  const { data: balance, refetch: refetchBal } = useReadContract({
    address: TOKEN || undefined, abi: ERC20, functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: Boolean(TOKEN && hasWallet), refetchInterval: 20_000 },
  });

  const { data: claimed, refetch: refetchClaimed } = useReadContract({
    address: FAUCET || undefined, abi: FAUCET_ABI, functionName: "claimed",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: hasFaucet },
  });

  const { data: canClaim, refetch: refetchCanClaim } = useReadContract({
    address: FAUCET || undefined, abi: FAUCET_ABI, functionName: "canClaim",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: hasFaucet },
  });

  const { data: lastReq, refetch: refetchLast } = useReadContract({
    address: FAUCET || undefined, abi: FAUCET_ABI, functionName: "lastRequestAt",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: hasFaucet },
  });

  const { data: cooldown } = useReadContract({
    address: FAUCET || undefined, abi: FAUCET_ABI, functionName: "cooldown",
    query: { enabled: Boolean(FAUCET) },
  });

  const { data: dripTok } = useReadContract({
    address: FAUCET || undefined, abi: FAUCET_ABI, functionName: "tokenDripAmount",
    query: { enabled: Boolean(FAUCET) },
  });

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchBal(), refetchClaimed(), refetchCanClaim(), refetchLast()]);
  }, [refetchBal, refetchClaimed, refetchCanClaim, refetchLast]);

  const send = useCallback(async (address, abi, fn, args) => {
    if (!wallet || !walletAddress) throw new Error("wallet not ready");
    setBusy(true); setTxError(null);
    try {
      const hash = await wallet.writeContract({ address, abi, functionName: fn, args, account: wallet.account });
      setLastTx(hash);
      const rc = await pub.waitForTransactionReceipt({ hash, timeout: 120_000 });
      if (rc.status !== "success") throw new Error("transaction reverted");
      await refetchAll();
      return hash;
    } catch (e) {
      setTxError(e.shortMessage || e.message || "tx failed");
      throw e;
    } finally { setBusy(false); }
  }, [wallet, walletAddress, pub, refetchAll]);

  const claim = useCallback(() => send(FAUCET, FAUCET_ABI, "claim", []), [send]);
  const refill = useCallback(() => send(FAUCET, FAUCET_ABI, "refillTokens", []), [send]);
  const requestTokens = claim;

  const lastAt = Number(lastReq ?? 0n);
  const cdSecs = Number(cooldown ?? 43_200n);
  const nextAt = lastAt ? lastAt + cdSecs : 0;
  const remaining = nextAt > now ? nextAt - now : 0;

  return {
    token: TOKEN,
    balance: balance ?? 0n,
    claimed: Boolean(claimed),
    canClaim: Boolean(canClaim),
    drip: dripTok ?? 0n,
    cooldownSeconds: cdSecs,
    nextRequestAt: nextAt,
    cooldownRemaining: remaining,
    now,
    busy, txError, lastTx,
    claim, refill, send, refetch: refetchAll,
  };
}

/* ---------- trading: approve + buy/sell ---------- */

export function useTrader(walletAddress, onDone) {
  const pub = usePublicClient();
  const { data: wallet } = useWalletClient();
  const [busy, setBusy] = useState(false);
  const [txError, setTxError] = useState(null);

  const run = useCallback(async (address, abi, fn, args) => {
    if (!wallet || !walletAddress) throw new Error("wallet not ready");
    const hash = await wallet.writeContract({ address, abi, functionName: fn, args, account: wallet.account });
    const rc = await pub.waitForTransactionReceipt({ hash, timeout: 120_000 });
    if (rc.status !== "success") throw new Error("transaction reverted");
    return hash;
  }, [wallet, walletAddress, pub]);

  const buy = useCallback(async (id, units, cost) => {
    setBusy(true); setTxError(null);
    try {
      const allowance = await pub.readContract({
        address: TOKEN, abi: ERC20, functionName: "allowance", args: [walletAddress, ADDRESS],
      });
      if (allowance < cost) await run(TOKEN, ERC20, "approve", [ADDRESS, (1n << 256n) - 1n]);
      const hash = await run(ADDRESS, ABI, "buy", [id, units]);
      await onDone?.();
      return hash;
    } catch (e) {
      setTxError(e.shortMessage || e.message || "buy failed");
      throw e;
    } finally { setBusy(false); }
  }, [pub, run, walletAddress, onDone]);

  const sell = useCallback(async (id, units) => {
    setBusy(true); setTxError(null);
    try {
      const hash = await run(ADDRESS, ABI, "sell", [id, units]);
      await onDone?.();
      return hash;
    } catch (e) {
      setTxError(e.shortMessage || e.message || "sell failed");
      throw e;
    } finally { setBusy(false); }
  }, [run, onDone]);

  return { buy, sell, busy, txError };
}

/* ---------- holdings ---------- */

export function useHoldings(address, rows, pub) {
  const [map, setMap] = useState({});
  useEffect(() => {
    let cancelled = false;
    if (!address || !pub || !ADDRESS || !rows.length) { setMap({}); return; }
    (async () => {
      try {
        const entries = await Promise.all(
          rows.map(async (r) => {
            const units = await pub.readContract({
              address: ADDRESS, abi: ABI, functionName: "unitsOf", args: [address, r.id],
            });
            return [r.id, units];
          })
        );
        if (cancelled) return;
        const next = {};
        for (const [id, units] of entries) {
          if (units === 0n) continue;
          const row = rows.find((r) => r.id === id);
          if (!row) continue;
          next[id] = { id, name: row.name, position: row.position, units, value: units * priceOf(row.position) };
        }
        setMap(next);
      } catch {
        if (!cancelled) setMap({});
      }
    })();
    return () => { cancelled = true; };
  }, [address, rows, pub]);
  return map;
}

export { ABI, FAUCET_ABI, ADDRESS, FAUCET, TOKEN, ERC20, EXPLORER, fmt as usd, fmt, idOf, formatEther, parseEther };

import { useState, useEffect, useCallback, useRef } from "react";
import { usePublicClient, useWalletClient, useReadContract, useBalance } from "wagmi";
import { keccak256, toHex, formatEther, parseEther } from "viem";
import artifact from "./MogMarket.json";
import faucetArtifact from "./MogFaucetV3.json";
import { EXPLORER } from "./chain.js";

const ABI = artifact.abi;
const FAUCET_ABI = faucetArtifact.abi;
const ABI_FUNCS = new Set((ABI || []).filter((x) => x.type === "function").map((x) => x.name));

const ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "").trim();
const FAUCET = (process.env.NEXT_PUBLIC_FAUCET_ADDRESS || "").trim();
const TOKEN = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "").trim();

/* Official Fluent testnet faucet (ETH for gas). Our contract only drips FLUENT. */
export const GAS_FAUCET_URL = "https://portal.fluent.xyz/builder/faucet";

/* Mainnet FLUENT reference price (snapshot from deploy-v3.mjs, live-refreshed). */
export const FALLBACK_FLUENT_USD = Number(process.env.NEXT_PUBLIC_FLUENT_USD || "") || 0.0476;

/* The asset symbol lives in one place; every label in the UI reads from here. */
export const SYMBOL = "FLUENT";

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

/* Rank movement as text. Zero movement is an em dash everywhere — never "flat". */
export const deltaText = (d) => (d > 0 ? "+" + d : d < 0 ? String(d) : "—");
export const deltaDir = (d) => (d > 0 ? "u" : d < 0 ? "d" : "f");
/* Same rule as a number, for sorting/filters. */
export const deltaOf = (r) => Number(r?.delta) || 0;

/* ---------- Motion board feed: movement, identity, socials ----------
   The on-chain struct only carries name/rank/delta, so movement and identity art
   come from Motion through our own /api/board route (one cached endpoint for
   every browser instead of direct upstream calls). Polled, so the board keeps
   moving without a reload. */

const BOARD_API = "/api/board";
export const PFP_URL = (uuid) => `https://leaderboard.motion.game/pfp/${uuid}.jpg`;

/* Two-speed polling: the Motion snapshot changes upstream every ~2 min, so the
   feed reads every 3 s (swr-cached at the edge, so a hundred tabs still cost one
   upstream call) and the on-chain board every 6 s. Both fire immediately on tab
   focus so a returning tab is never more than one paint stale. */
export function useBoardFeed(intervalMs = 3000) {
  const [feed, setFeed] = useState({ rows: [], capturedAt: null, at: null });
  const [syncedAt, setSyncedAt] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(BOARD_API, { headers: { accept: "application/json" }, cache: "no-store" });
      if (!r.ok) return;
      const d = await r.json();
      if (!Array.isArray(d.rows)) return;
      setFeed({ rows: d.rows, capturedAt: d.capturedAt || null, at: d.asOf || null });
      setSyncedAt(Date.now());
    } catch { /* offline → keep the last board */ }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, intervalMs);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(t); window.removeEventListener("focus", onFocus); };
  }, [load, intervalMs]);

  const meta = {};
  for (const row of feed.rows) {
    if (!row?.name) continue;
    meta[row.name.trim().toLowerCase()] = {
      uuid: row.id, name: row.name, position: Number(row.position) || 0,
      socials: row.socials || {},
    };
  }
  return { meta, rows: feed.rows, capturedAt: feed.capturedAt, syncedAt, reload: load };
}

/* ---------- rolling rank history (charts) ----------
   Motion publishes snapshots but no history endpoint, so /api/board-history
   archives each live snapshot it sees and returns a per-creator rank series.
   Charts read that and nothing else. */

export function useRankHistory(intervalMs = 30_000) {
  const [state, setState] = useState({ series: {}, points: 0, window: null });
  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const r = await fetch("/api/board-history", { headers: { accept: "application/json" }, cache: "no-store" });
        if (!r.ok) return;
        const d = await r.json();
        if (live && d?.series) setState({ series: d.series, points: d.points || 0, window: d.window || null });
      } catch { /* keep whatever we had */ }
    };
    load();
    const t = setInterval(load, intervalMs);
    return () => { live = false; clearInterval(t); };
  }, [intervalMs]);
  return state;
}


/* ---------- prices / fx ----------
   USD spot for FLUENT (dexscreener, mainnet pair) + ETH/USDT/USDC and the
   fiat table (CoinGecko via /api/rates). Switching display currency is a pure
   multiply, so it never re-queries the chain. */

const FX_FALLBACK = {
  usd: FALLBACK_FLUENT_USD,
  bySymbol: { FLUENT: FALLBACK_FLUENT_USD, BLEND: FALLBACK_FLUENT_USD, ETH: 1813, USDT: 1, USDC: 1 },
  rates: { USD: 1, IDR: 16100, EUR: 0.92, GBP: 0.79, SGD: 1.34, JPY: 155, INR: 88, MYR: 4.4, AUD: 1.55, CNY: 7.2 },
  at: null,
};

export function usePrices() {
  const [fx, setFx] = useState(FX_FALLBACK);
  const [source, setSource] = useState("snapshot");
  useEffect(() => {
    let live = true;
    (async () => {
      const next = { ...FX_FALLBACK, bySymbol: { ...FX_FALLBACK.bySymbol }, rates: { ...FX_FALLBACK.rates } };
      const src = [];
      try {
        const r = await fetch("https://api.dexscreener.com/tokens/v1/ethereum/0xd8A271974E8EdAE9D7b58e3370dc1669427503F4");
        const pairs = await r.json();
        const best = (Array.isArray(pairs) ? pairs : []).sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
        if (best?.priceUsd) {
          const p = Number(best.priceUsd);
          next.bySymbol.FLUENT = p; next.bySymbol.BLEND = p; next.usd = p;
          src.push("dexscreener");
        }
      } catch { /* keep snapshot */ }
      try {
        const r = await fetch("/api/rates");
        if (r.ok) {
          const d = await r.json();
          for (const s of ["ETH", "USDT", "USDC"]) {
            if (d?.bySymbol?.[s]) next.bySymbol[s] = Number(d.bySymbol[s]);
          }
          if (d?.rates?.IDR) next.rates = { ...next.rates, ...d.rates };
          next.at = d.at || null;
          src.push(d.source || "coingecko");
        }
      } catch { /* keep snapshot */ }
      if (!live) return;
      setFx(next);
      setSource(src.join(" · ") || "snapshot");
    })();
    return () => { live = false; };
  }, []);
  return { ...fx, source };
}

/* Fiat formatter for the user's chosen display currency. */
const ZERO_DEC = new Set(["IDR", "JPY", "KRW", "VND", "CLP", "HUF"]);
export function makeMoney(rates, currency) {
  const rate = Number(rates?.[currency] ?? 1);
  return (usdValue) => {
    const v = Number(usdValue || 0) * rate;
    const dec = v >= 1000 || ZERO_DEC.has(currency) ? 0 : v >= 1 ? 2 : 4;
    const num = v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (currency === "USD") return "$" + num;
    if (currency === "IDR") return "Rp " + num;
    return num + " " + currency;
  };
}


/* ---------- board ----------
   Chain rows are authoritative (names + rank). Motion's feed is layered on for
   movement and identity; a creator the feed doesn't carry keeps delta 0 rather
   than disappearing. Both are re-read on a timer, so nothing needs a reload. */

export function useBoard(feed, intervalMs = 6000) {
  const pub = usePublicClient();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncedAt, setSyncedAt] = useState(null);
  const mcOk = useRef(null);   // null = untested, true = multicall works, false = fall back

  const load = useCallback(async () => {
    if (!ADDRESS || !pub) { setLoading(false); return; }
    try {
      setError(null);
      const count = await pub.readContract({ address: ADDRESS, abi: ABI, functionName: "creatorCount" });
      const n = Number(count);
      if (!n) { setRows([]); setLoading(false); return; }

      /* Fluent Testnet ships no multicall3, so we try the batched path first and
         fall back to parallel single reads the moment the chain says no. The
         fallback result is cached for the life of the tab (\`mcOk\`) so we never
         pay the failed attempt twice. */
      const readAll = async (calls) => {
        if (mcOk.current !== false) {
          try {
            const res = await pub.multicall({ contracts: calls, allowFailure: true });
            mcOk.current = true;
            return res.map((r) => (r.status === "success" ? r.result : null));
          } catch {
            mcOk.current = false;
          }
        }
        return Promise.all(
          calls.map((c) =>
            pub.readContract({ address: c.address, abi: c.abi, functionName: c.functionName, args: c.args })
              .catch(() => null)
          )
        );
      };

      const idCalls = Array.from({ length: n }, (_, i) => ({
        address: ADDRESS, abi: ABI, functionName: "creatorIdAt", args: [BigInt(i)],
      }));
      const ids = await readAll(idCalls);

      const metaCalls = ids.filter(Boolean).map((id) => ({
        address: ADDRESS, abi: ABI, functionName: "creatorOf", args: [id],
      }));
      const metas = await readAll(metaCalls);

      const out = [];
      ids.forEach((id, i) => {
        const m = metas[i];
        if (!id || !m || !m.exists || Number(m.rank) <= 0) return;
        out.push({ id, name: m.name, position: Number(m.rank), delta: Number(m.delta), exists: m.exists });
      });
      out.sort((a, b) => a.position - b.position);
      setRows(out);
      setSyncedAt(Date.now());
    } catch (e) {
      setError(e.shortMessage || e.message || "board read failed");
    } finally {
      setLoading(false);
    }
  }, [pub]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!intervalMs) return;
    const t = setInterval(load, intervalMs);
    return () => clearInterval(t);
  }, [load, intervalMs]);

  const feedBy = {};
  for (const f of feed?.rows || []) feedBy[(f.name || "").trim().toLowerCase()] = f;

  const merged = rows.map((r) => {
    const f = feedBy[r.name.trim().toLowerCase()];
    const moved = f && Number.isFinite(Number(f.delta)) ? Number(f.delta) : null;
    return {
      ...r,
      delta: moved ?? (Number.isFinite(r.delta) ? r.delta : 0),
      live: Boolean(f),
      uuid: f?.id || null,
    };
  });

  return { rows: merged, loading, error, reload: load, syncedAt };
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
    query: { enabled: Boolean(TOKEN && hasWallet), refetchInterval: 15_000 },
  });

  /* Native testnet ETH — gas money, shown next to FLUENT in the wallet card. */
  const { data: ethBal, refetch: refetchEth } = useBalance({
    address: walletAddress || undefined,
    query: { enabled: hasWallet, refetchInterval: 15_000 },
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
    await Promise.all([refetchBal(), refetchEth(), refetchClaimed(), refetchCanClaim(), refetchLast()]);
  }, [refetchBal, refetchEth, refetchClaimed, refetchCanClaim, refetchLast]);

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
    ethBalance: ethBal?.value ?? 0n,
    ethSymbol: ethBal?.symbol || "ETH",
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

/* ---------- holdings ----------
   `entry` is the average price the wallet actually paid per unit when the
   contract exposes it, so the portfolio can show real PnL. Re-read on a timer
   alongside the board, so an open position never goes stale on screen. */

export function useHoldings(address, rows, pub, intervalMs = 25_000) {
  const [map, setMap] = useState({});
  const [entryKnown, setEntryKnown] = useState(false);

  const load = useCallback(async () => {
    if (!address || !pub || !ADDRESS || !rows.length) { setMap({}); return; }
    try {
      const entries = await Promise.all(
        rows.map(async (r) => {
          const units = await pub.readContract({
            address: ADDRESS, abi: ABI, functionName: "unitsOf", args: [address, r.id],
          });
          if (!units) return [r.id, null, 0n];
          /* Average entry price: only if this build's ABI exposes a position view. */
          let entry = null;
          const fnName = ["positionOf", "positions", "position"].find((f) => ABI_FUNCS.has(f));
          if (fnName) {
            try {
              const p = await pub.readContract({ address: ADDRESS, abi: ABI, functionName: fnName, args: [address, r.id] });
              const avg = p?.avgCost ?? p?.entryPrice ?? p?.costBasis ?? p?.avgPrice ?? null;
              if (avg != null) entry = BigInt(avg);
            } catch { /* not in this build */ }
          }
          return [r.id, entry, units];
        })
      );
      const next = {};
      let anyEntry = false;
      for (const [id, entry, units] of entries) {
        if (!units) continue;
        const row = rows.find((r) => r.id === id);
        if (!row) continue;
        const px = priceOf(row.position);
        const value = units * px;
        /* PnL only exists where the contract tells us the entry price. */
        const cost = entry != null ? units * entry : null;
        const pnlAbs = cost != null ? value - cost : null;
        const pnlPct = cost && cost > 0n ? Number((pnlAbs * 10_000n) / cost) / 100 : null;
        if (entry != null) anyEntry = true;
        next[id] = {
          id, name: row.name, position: row.position, units,
          price: px, value, entry, cost,
          pnlAbs,
          pnlPct,
          pnlUsd: pnlAbs != null ? Number(pnlAbs) / 1e18 : null,
        };
      }
      setMap(next);
      setEntryKnown(anyEntry);
    } catch {
      setMap({});
    }
  }, [address, rows, pub]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!intervalMs) return;
    const t = setInterval(load, intervalMs);
    return () => clearInterval(t);
  }, [load, intervalMs]);

  return { map, entryKnown, reload: load };
}

/* ---------- theme: light / dark / auto ----------
   Persisted per browser; `auto` follows the OS and keeps following it. The
   resolved value lands on <html data-theme> so every CSS variable flips. */

export function useTheme() {
  const [mode, setMode] = useState("auto");
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mm.theme");
      if (saved === "light" || saved === "dark" || saved === "auto") setMode(saved);
    } catch { /* private mode */ }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved = mode === "auto" ? (systemDark ? "dark" : "light") : mode;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", resolved);
    root.style.colorScheme = resolved;
  }, [resolved]);

  const pick = useCallback((next) => {
    setMode(next);
    try { localStorage.setItem("mm.theme", next); } catch { /* ignore */ }
  }, []);

  return { mode, resolved, pick };
}

export { ABI, FAUCET_ABI, ADDRESS, FAUCET, TOKEN, ERC20, EXPLORER, fmt as usd, fmt, idOf, formatEther, parseEther };

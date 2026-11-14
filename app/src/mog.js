import { useState, useEffect, useCallback, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, usePublicClient, useWalletClient, useReadContract, useReadContracts } from "wagmi";
import { keccak256, toHex, formatEther, parseEther } from "viem";
import artifact from "./MogMarket.json";
import { EXPLORER } from "./chain.js";

const ABI = artifact.abi;
const ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || "").trim();

/* Paper dollars are 18-decimal onchain. Format compactly for the board. */
const usd = (wei, digits = 2) => {
  const n = Number(formatEther(wei ?? 0n));
  if (n >= 1000) return "$" + n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return "$" + n.toFixed(digits);
};
const idOf = (name) => keccak256(toHex(name));

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
        return {
          id,
          name: m.name,
          position: Number(m.rank),
          delta: Number(m.delta),
          exists: m.exists,
        };
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

export function usePaper(walletAddress) {
  const pub = usePublicClient();
  const { data: wallet } = useWalletClient();
  const [busy, setBusy] = useState(false);
  const [txError, setTxError] = useState(null);
  const [lastTx, setLastTx] = useState(null);

  const { data: enrolled, refetch: refetchEnrolled } = useReadContract({
    address: ADDRESS || undefined,
    abi: ABI,
    functionName: "enrolled",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: Boolean(ADDRESS && walletAddress) },
  });

  const { data: cashRaw, refetch: refetchCash } = useReadContract({
    address: ADDRESS || undefined,
    abi: ABI,
    functionName: "cash",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: Boolean(ADDRESS && walletAddress) },
  });

  const { data: equityRaw, refetch: refetchEquity } = useReadContract({
    address: ADDRESS || undefined,
    abi: ABI,
    functionName: "equityOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: Boolean(ADDRESS && walletAddress) },
  });

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchEnrolled(), refetchCash(), refetchEquity()]);
  }, [refetchEnrolled, refetchCash, refetchEquity]);

  const send = useCallback(async (fn, args, value) => {
    if (!wallet || !walletAddress) throw new Error("wallet not ready");
    setBusy(true);
    setTxError(null);
    try {
      const hash = await wallet.writeContract({
        address: ADDRESS,
        abi: ABI,
        functionName: fn,
        args,
        ...(value ? { value } : {}),
        account: wallet.account,
      });
      setLastTx(hash);
      const rc = await pub.waitForTransactionReceipt({ hash, timeout: 90_000 });
      if (rc.status !== "success") throw new Error("transaction reverted");
      await refetchAll();
      return hash;
    } catch (e) {
      const msg = e.shortMessage || e.message || "tx failed";
      setTxError(msg);
      throw e;
    } finally {
      setBusy(false);
    }
  }, [wallet, walletAddress, pub, refetchAll]);

  const enroll = useCallback(() => send("enroll", []), [send]);
  const buy = useCallback((id, units, costWei) => send("buy", [id, units], costWei), [send]);
  const sell = useCallback((id, units) => send("sell", [id, units]), [send]);

  return {
    enrolled: Boolean(enrolled),
    cash: cashRaw ?? 0n,
    equity: equityRaw ?? 0n,
    busy,
    txError,
    lastTx,
    enroll,
    buy,
    sell,
    refetch: refetchAll,
  };
}

export { ABI, ADDRESS, EXPLORER, usd, idOf, formatEther, parseEther };

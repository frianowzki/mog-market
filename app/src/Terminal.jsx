import { useState, useMemo, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, usePublicClient } from "wagmi";
import {
  useBoard, useFluent, useFluentPrice, useTrader, useHoldings,
  ADDRESS, FAUCET, TOKEN, EXPLORER, fmt, priceOf,
} from "./mog.js";
import { fluentTestnet } from "./chain.js";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.2 22H3.1l7.3-8.3L1 2h6.5l4.4 5.9L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z" />
    </svg>
  );
}

function Health({ loading, error }) {
  if (loading) return <span className="chain-pill">reading…</span>;
  if (error) return <span className="chain-pill bad">chain error</span>;
  if (!ADDRESS) return <span className="chain-pill bad">no contract</span>;
  return <span className="chain-pill ok">fluent {fluentTestnet.id}</span>;
}

const hhmm = (secs) => {
  if (secs <= 0) return "ready";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
};

export function Terminal() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { address } = useAccount();
  const pub = usePublicClient();
  const { rows, loading, error, reload } = useBoard();
  const fluent = useFluent(address);
  const { usd: fluentUsd, source: priceSource } = useFluentPrice();
  const trader = useTrader(address, reload);
  const holdingMap = useHoldings(address, rows, pub);

  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const flash = useCallback((msg, isErr) => {
    setToast({ msg, isErr });
    setTimeout(() => setToast(null), 4600);
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(needle));
  }, [rows, q]);

  const sel = selected ? rows.find((r) => r.id === selected) : null;
  const selPrice = sel ? priceOf(sel.position) : 0n;
  const busy = trader.busy || fluent.busy;

  /* USD value of a FLUENT wei amount at the mainnet rate. */
  const inUsd = (wei) => {
    const n = Number(fluentUsd) * (Number(wei) / 1e18);
    const f = n >= 100 ? n.toFixed(0) : n >= 1 ? n.toFixed(2) : n.toFixed(4);
    return "$" + Number(f).toLocaleString("en-US");
  };

  const wrapped = useCallback(async (fn, label) => {
    try {
      await fn();
      flash(label + " · confirmed", false);
    } catch (e) {
      flash((e.shortMessage || e.message || "failed").slice(0, 130), true);
    }
  }, [flash]);

  const onClaim = () => wrapped(() => fluent.claim(), "onboarded · 5,000 FLUENT + gas");
  const onRefill = () => wrapped(() => fluent.refill(), "requested 5,000 FLUENT");

  const onBuy = () => {
    if (!sel) return;
    wrapped(async () => {
      if (fluent.balance < selPrice) throw new Error("not enough FLUENT for 1 unit");
      await trader.buy(sel.id, 1n, selPrice);
      await fluent.refetch();
      await reload();
    }, `bought 1 × ${sel.name}`);
  };

  const onSell = () => {
    if (!sel) return;
    const held = holdingMap[sel.id]?.units ?? 0n;
    wrapped(async () => {
      if (held === 0n) throw new Error("no units to sell");
      await trader.sell(sel.id, held);
      await fluent.refetch();
      await reload();
    }, `sold ${sel.name}`);
  };

  if (!ready) {
    return (
      <>
        <TopBar />
        <div className="center-msg">initialising…</div>
      </>
    );
  }

  const holdings = Object.values(holdingMap);
  const bookValue = holdings.reduce((a, h) => a + h.value, 0n);
  const netWorth = fluent.balance + bookValue;

  return (
    <>
      <TopBar authed={authenticated} address={address} onLogout={logout} loading={loading} error={error} />

      {!ADDRESS && (
        <div className="banner">
          No contract address configured — set VITE_CONTRACT_ADDRESS and rebuild.
        </div>
      )}
      {error && <div className="banner">Board read failed: {error}</div>}

      <header className="mast">
        <div className="kicker">Motion leaderboard · FLUENT trading · onchain</div>
        <div className="mast-row">
          <h1>Reputations are <i>cheap</i> today.</h1>
          <div className="deck">
            <p>
              Every creator is a tradable share. Price is <b>1000 ÷ rank</b>, settled in{" "}
              <b>FLUENT</b> on Fluent Testnet. The faucet gives <b>5,000 FLUENT</b> per request,
              repeatable every <b>12 hours</b>.
            </p>
            <p>
              FLUENT is priced against mainnet: <b>{inUsd(10n ** 18n)}</b> per token{" "}
              <span className="num" style={{ color: "var(--mute)", fontSize: 10 }}>({priceSource})</span>.
            </p>
          </div>
        </div>
      </header>

      {!authenticated ? (
        <div className="login-wrap">
          <h2>Sign in to trade</h2>
          <p>{rows.length} creators are on the board. Log in with X to get a wallet and your FLUENT.</p>
          <button className="x-btn" onClick={login}>
            <XIcon /> Continue with X
          </button>
          {ADDRESS && (
            <p className="num" style={{ fontSize: 10, color: "var(--mute)" }}>
              market {ADDRESS.slice(0, 10)}…{ADDRESS.slice(-6)} ·{" "}
              <a href={`${EXPLORER}/address/${ADDRESS}`} target="_blank" rel="noreferrer">fluentscan</a>
            </p>
          )}
        </div>
      ) : (
        <div className="shell">
          <main>
            <div className="board-h">
              <span className="t">price board · {filtered.length}/{rows.length}</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="filter ticker"
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {loading ? (
              <div className="center-msg">reading board from fluent…</div>
            ) : rows.length === 0 ? (
              <div className="center-msg">board is empty — no creators synced onchain yet</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Creator</th>
                    <th>Price (FLUENT)</th>
                    <th>USD</th>
                    <th>Rank Δ</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const held = holdingMap[r.id];
                    const isSel = selected === r.id;
                    const p = priceOf(r.position);
                    return (
                      <tr
                        key={r.id}
                        className={"asset" + (held || isSel ? " held" : "")}
                        onClick={() => setSelected(r.id)}
                      >
                        <td className="rank num">{r.position}</td>
                        <td>
                          <div className="who">
                            <NameAvatar name={r.name} />
                            <span className="nm">{r.name}</span>
                            {held && <span className="tag">held</span>}
                          </div>
                        </td>
                        <td className="price">{fmt(p)}</td>
                        <td className="num" style={{ color: "var(--mute)", fontSize: 11 }}>{inUsd(p)}</td>
                        <td className={"chg " + (r.delta > 0 ? "u" : r.delta < 0 ? "d" : "f")}>
                          {r.delta === 0 ? "flat" : (r.delta > 0 ? "+" : "") + r.delta}
                        </td>
                        <td className="act">
                          <button
                            className={"buy" + (held ? " own" : "")}
                            disabled={busy || !fluent.claimed}
                            onClick={(e) => { e.stopPropagation(); setSelected(r.id); }}
                          >
                            {held ? "Add" : "Buy"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </main>

          <aside className="side">
            <div className="side-h">
              <div className="t">net worth</div>
              <div className="v">{fmt(netWorth)} FLUENT</div>
              <div className="sub">
                {holdings.length} position{holdings.length === 1 ? "" : "s"} ·{" "}
                {fmt(fluent.balance)} FLUENT liquid · ≈ {inUsd(netWorth)}
              </div>
            </div>

            <div className="stats">
              <div>
                <i>balance</i>
                <b>{fmt(fluent.balance)}</b>
              </div>
              <div>
                <i>in positions</i>
                <b>{fmt(bookValue)}</b>
              </div>
            </div>

            <div className="holdings">
              {holdings.length === 0 ? (
                <div className="empty">
                  <b>Empty book.</b> Pick a creator and buy in. Price is 1000 ÷ rank, so climbing pays you.
                </div>
              ) : (
                holdings.map((h) => (
                  <div key={h.id} className="hold" onClick={() => setSelected(h.id)}>
                    <NameAvatar name={h.name} small />
                    <div className="meta">
                      <div className="nm">{h.name}</div>
                      <div className="qty">{h.units.toString()} u @ {fmt(priceOf(h.position))}</div>
                    </div>
                    <div>
                      <div className="val">{fmt(h.value)}</div>
                      <div style={{ color: "var(--mute)", fontSize: 11 }}>{inUsd(h.value)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="side-f">
              {!fluent.claimed ? (
                <button className="btn primary" disabled={busy || !fluent.canClaim} onClick={onClaim}>
                  {fluent.busy ? "confirming…" : fluent.canClaim ? "claim gas + 5,000 FLUENT" : "faucet ETH pool empty"}
                </button>
              ) : (
                <>
                  <button
                    className="btn primary"
                    disabled={busy || !sel || fluent.balance < selPrice}
                    onClick={onBuy}
                  >
                    {!sel
                      ? "select a creator"
                      : trader.busy
                        ? "confirming…"
                        : `buy 1 × ${sel.name.slice(0, 14)} · ${fmt(selPrice)}`}
                  </button>
                  <button
                    className="btn ghost"
                    disabled={busy || !sel || !holdingMap[sel?.id]}
                    onClick={onSell}
                  >
                    {sel && holdingMap[sel.id] ? `sell ${holdingMap[sel.id].units} u` : "sell"}
                  </button>
                  <button
                    className="btn ghost"
                    disabled={busy || fluent.cooldownRemaining > 0}
                    onClick={onRefill}
                    title="5,000 FLUENT every 12 hours"
                  >
                    {fluent.cooldownRemaining > 0
                      ? `next request in ${hhmm(fluent.cooldownRemaining)}`
                      : "request 5,000 FLUENT"}
                  </button>
                </>
              )}
              <div className="note">
                {fluent.lastTx || trader.busy ? (
                  <a href={`${EXPLORER}/tx/${fluent.lastTx}`} target="_blank" rel="noreferrer">
                    last tx {String(fluent.lastTx).slice(0, 10)}…
                  </a>
                ) : (
                  "FLUENT · fluent testnet"
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {toast && <div className={"toast on" + (toast.isErr ? " err" : "")}>{toast.msg}</div>}
    </>
  );
}

function NameAvatar({ name, small }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return (
    <span
      style={{
        width: small ? 22 : 26,
        height: small ? 22 : 26,
        flex: "none",
        borderRadius: 2,
        display: "grid",
        placeItems: "center",
        background: `hsl(${h} 10% 86%)`,
        color: `hsl(${h} 22% 34%)`,
        fontFamily: "Archivo,sans-serif",
        fontSize: small ? 9 : 10,
        fontWeight: 600,
      }}
    >
      {initials}
    </span>
  );
}

function TopBar({ authed, address, onLogout, loading, error }) {
  return (
    <div className="top">
      <span>
        <span className="pulse" /> <b>MOG MARKET</b>
      </span>
      <span className="mid">FLUENT trading · fluent testnet</span>
      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Health loading={loading} error={error} />
        {authed && address && (
          <span className="acct">
            {address.slice(0, 6)}…{address.slice(-4)}
            <button onClick={onLogout}>exit</button>
          </span>
        )}
      </span>
    </div>
  );
}

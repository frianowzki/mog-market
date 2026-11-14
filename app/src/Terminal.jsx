import { useState, useMemo, useCallback, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, usePublicClient } from "wagmi";
import { formatEther } from "viem";
import { useBoard, usePaper, ABI, ADDRESS, EXPLORER, usd, idOf } from "./mog.js";
import { fluentTestnet } from "./chain.js";

const BASE_PRICE = 1000n * 10n ** 18n;
const priceOf = (rank) => (rank > 0 ? BASE_PRICE / BigInt(rank) : 0n);

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

export function Terminal() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { address, isConnected } = useAccount();
  const pub = usePublicClient();
  const { rows, loading, error, reload } = useBoard();
  const paper = usePaper(address);

  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const flash = useCallback((msg, isErr) => {
    setToast({ msg, isErr });
    setTimeout(() => setToast(null), 4200);
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(needle));
  }, [rows, q]);

  const holdingMap = useHoldings(address, rows, pub);

  const sel = selected ? rows.find((r) => r.id === selected) : null;
  const selPrice = sel ? priceOf(sel.position) : 0n;

  const wrapped = useCallback(async (fn, label) => {
    try {
      await fn();
      flash(label + " · confirmed", false);
    } catch (e) {
      flash((e.shortMessage || e.message || "failed").slice(0, 120), true);
    }
  }, [flash]);

  const onEnroll = () => wrapped(() => paper.enroll(), "enrolled · $1,000 credited");

  const onBuy = () => {
    if (!sel) return;
    const oneUnit = selPrice;
    wrapped(async () => {
      if (paper.cash < oneUnit) throw new Error("not enough paper cash for 1 unit");
      await paper.buy(sel.id, 1n, oneUnit);
      await reload();
    }, `bought 1 × ${sel.name}`);
  };

  const onSell = () => {
    if (!sel) return;
    const held = holdingMap[sel.id]?.units ?? 0n;
    wrapped(async () => {
      if (held === 0n) throw new Error("no units to sell");
      await paper.sell(sel.id, held);
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

  return (
    <>
      <TopBar
        authed={authenticated}
        address={address}
        onLogout={logout}
        loading={loading}
        error={error}
      />

      {!ADDRESS && (
        <div className="banner">
          No contract address configured — set VITE_CONTRACT_ADDRESS to a deployed MogMarket
          and rebuild. The board below will stay empty until then.
        </div>
      )}
      {error && <div className="banner">Board read failed: {error}</div>}

      <header className="mast">
        <div className="kicker">Motion leaderboard · paper trading · onchain</div>
        <div className="mast-row">
          <h1>Reputations are <i>cheap</i> today.</h1>
          <div className="deck">
            <p>
              Every creator is a tradable share. Price is <b>1000 ÷ rank</b>, so a rank move
              is a price move. You start with <b>$1,000</b> of paper capital, settled by a
              contract on <b>Fluent Testnet</b>.
            </p>
            <p>
              Sign in with X — a wallet is created for you. Your positions live onchain, not
              in this tab.
            </p>
          </div>
        </div>
      </header>

      {!authenticated ? (
        <div className="login-wrap">
          <h2>Sign in to trade</h2>
          <p>
            {rows.length} creators are on the board. Log in with X to get a wallet and your
            paper stack.
          </p>
          <button className="x-btn" onClick={login}>
            <XIcon /> Continue with X
          </button>
          {ADDRESS && (
            <p className="num" style={{ fontSize: 10, color: "var(--mute)" }}>
              contract {ADDRESS.slice(0, 10)}…{ADDRESS.slice(-6)} ·{" "}
              <a href={`${EXPLORER}/address/${ADDRESS}`} target="_blank" rel="noreferrer">
                fuentscan
              </a>
            </p>
          )}
        </div>
      ) : (
        <div className="shell">
          <main>
            <div className="board-h">
              <span className="t">
                price board · {filtered.length}/{rows.length}
              </span>
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
                    <th>Price</th>
                    <th>Rank Δ</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const held = holdingMap[r.id];
                    const isSel = selected === r.id;
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
                        <td className="price">{usd(priceOf(r.position))}</td>
                        <td className={"chg " + (r.delta > 0 ? "u" : r.delta < 0 ? "d" : "f")}>
                          {r.delta === 0 ? "flat" : (r.delta > 0 ? "+" : "") + r.delta}
                        </td>
                        <td className="act">
                          <button
                            className={"buy" + (held ? " own" : "")}
                            disabled={paper.busy || !paper.enrolled}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(r.id);
                            }}
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
              <div className="t">net liquidation</div>
              <div className="v">{usd(paper.equity)}</div>
              <div className="sub">
                {Object.keys(holdingMap).length} position
                {Object.keys(holdingMap).length === 1 ? "" : "s"} · {usd(paper.cash)} cash
              </div>
            </div>

            <div className="stats">
              <div>
                <i>cash</i>
                <b>{usd(paper.cash)}</b>
              </div>
              <div>
                <i>pnl</i>
                <b className={paper.equity >= 1000n * 10n ** 18n ? "pos" : "neg"}>
                  {paper.equity >= 1000n * 10n ** 18n ? "+" : "−"}
                  {usd(paper.equity > 1000n * 10n ** 18n ? paper.equity - 1000n * 10n ** 18n : 1000n * 10n ** 18n - paper.equity)}
                </b>
              </div>
            </div>

            <div className="holdings">
              {Object.keys(holdingMap).length === 0 ? (
                <div className="empty">
                  <b>Empty book.</b>
                  Pick a creator on the board and buy in. Price is 1000 ÷ rank, so climbing
                  the leaderboard pays you.
                </div>
              ) : (
                Object.values(holdingMap).map((h) => (
                  <div key={h.id} className="hold" onClick={() => setSelected(h.id)}>
                    <NameAvatar name={h.name} small />
                    <div className="meta">
                      <div className="nm">{h.name}</div>
                      <div className="qty">
                        {h.units.toString()} u @ {usd(priceOf(h.position))}
                      </div>
                    </div>
                    <div>
                      <div className="val">{usd(h.value)}</div>
                      <div className={"pl " + (h.pl >= 0n ? "u" : "d")}>
                        {h.pl >= 0n ? "+" : "−"}
                        {usd(h.pl >= 0n ? h.pl : -h.pl)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="side-f">
              {!paper.enrolled ? (
                <button className="btn primary" disabled={paper.busy} onClick={onEnroll}>
                  {paper.busy ? "confirming…" : "claim $1,000"}
                </button>
              ) : (
                <>
                  <button
                    className="btn primary"
                    disabled={paper.busy || !sel || paper.cash < selPrice}
                    onClick={onBuy}
                  >
                    {!sel
                      ? "select a creator"
                      : paper.busy
                      ? "confirming…"
                      : `buy 1 × ${sel.name.slice(0, 14)} · ${usd(selPrice)}`}
                  </button>
                  <button
                    className="btn ghost"
                    disabled={paper.busy || !sel || !holdingMap[sel?.id]}
                    onClick={onSell}
                  >
                    {sel && holdingMap[sel.id]
                      ? `sell ${holdingMap[sel.id].units} u`
                      : "sell"}
                  </button>
                </>
              )}
              <div className="note">
                {paper.lastTx ? (
                  <a href={`${EXPLORER}/tx/${paper.lastTx}`} target="_blank" rel="noreferrer">
                    last tx {paper.lastTx.slice(0, 10)}…
                  </a>
                ) : (
                  "paper capital · fluent testnet"
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

/* Reads units for every visible creator in one multicall-ish batch. */
function useHoldings(address, rows, pub) {
  const [map, setMap] = useState({});
  useEffect(() => {
    let cancelled = false;
    if (!address || !pub || !ADDRESS || !rows.length) {
      setMap({});
      return;
    }
    (async () => {
      try {
        const entries = await Promise.all(
          rows.map(async (r) => {
            const units = await pub.readContract({
              address: ADDRESS,
              abi: ABI,
              functionName: "unitsOf",
              args: [address, r.id],
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
          const price = priceOf(row.position);
          const value = units * price;
          next[id] = {
            id,
            name: row.name,
            position: row.position,
            units,
            value,
            pl: value - units * priceOf(row.position),
          };
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
      <span className="mid">paper trading · fluent testnet</span>
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

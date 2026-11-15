"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, usePublicClient } from "wagmi";
import {
  useBoard, useFluent, usePrices, useTrader, useHoldings, useMotionMeta, makeMoney,
  ADDRESS, FAUCET, TOKEN, EXPLORER, fmt, priceOf, GAS_FAUCET_URL, PFP_URL,
} from "./mog.js";

/* ------------------------------------------------------------------ icons */

const Icon = ({ d, ...p }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d={d} />
  </svg>
);
const I = {
  feed: "M4 6h16M4 12h12M4 18h8",
  markets: "M3 17l5-6 4 4 5-8 4 5M3 21h18",
  portfolio: "M4 8h16v11H4zM8 8V5h8v3",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.6 1.6 0 008 19.4a1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H2a2 2 0 110-4h.1A1.6 1.6 0 004.6 8a1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V2a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H22a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z",
  drip: "M12 3s6 6.4 6 10.5A6 6 0 016 13.5C6 9.4 12 3 12 3z",
  logout: "M15 17l5-5-5-5M20 12H9M12 19H6a2 2 0 01-2-2V7a2 2 0 012-2h6",
  copy: "M9 9h9v9a2 2 0 01-2 2H9a2 2 0 01-2-2V9zM6 15H5a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1",
  ext: "M14 4h6v6M20 4l-8 8M18 14v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4",
};

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.2 22H3.1l7.3-8.3L1 2h6.5l4.4 5.9L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z" />
    </svg>
  );
}

const hhmm = (secs) => {
  if (secs <= 0) return "ready";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
};

/* Public handles we can stand behind, used when the feed carries no socials. */
const CURATED_SOCIALS = {
  ishowspeed: { x: "ishowspeed", youtube: "@IShowSpeed", instagram: "ishowspeed", tiktok: "@ishowspeed" },
  mrbeast: { x: "MrBeast", youtube: "@MrBeast", instagram: "mrbeast", tiktok: "@mrbeast" },
  elonmusk: { x: "elonmusk" },
  cristiano: { x: "Cristiano", instagram: "cristiano" },
};

export async function copyText(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch { return false; }
}

/* Links for a creator. Verified feed socials win; curated map next; the X
   search fallback is last and always resolves, so no card is ever empty. */
function socialLinks(name, metaSocials) {
  const key = (name || "").trim().toLowerCase();
  const curated = CURATED_SOCIALS[key] || {};
  const out = [];
  const x = metaSocials?.x;
  if (x?.verified && x.handle) {
    out.push({ k: "x", label: "X", url: x.url, handle: x.handle });
  } else if (curated.x) {
    out.push({ k: "x", label: "X", url: `https://x.com/${curated.x}`, handle: "@" + curated.x });
  } else {
    out.push({ k: "x", label: "X", url: `https://x.com/search?q=${encodeURIComponent(name)}&f=user`, handle: "find on X" });
  }
  if (curated.youtube) out.push({ k: "yt", label: "YouTube", url: `https://youtube.com/${curated.youtube}`, handle: curated.youtube });
  if (curated.instagram) out.push({ k: "ig", label: "Instagram", url: `https://instagram.com/${curated.instagram}`, handle: "@" + curated.instagram });
  if (curated.tiktok) out.push({ k: "tt", label: "TikTok", url: `https://tiktok.com/${curated.tiktok}`, handle: curated.tiktok });
  return out;
}

/* ------------------------------------------------------------------ widgets */

function BrandMark() {
  return (
    <div className="brand">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17l5-6 4 4 5-8 4 5" />
        </svg>
      </span>
      <span className="brand-name">Motion <i>Markets</i></span>
    </div>
  );
}

function NameAvatar({ name, uuid, size = 26 }) {
  const [failed, setFailed] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const initials = (name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  let h = 0;
  for (const ch of name || "") h = (h * 31 + ch.charCodeAt(0)) % 360;
  const src = useFallback
    ? `/api/avatar?name=${encodeURIComponent(name || "")}`
    : uuid ? PFP_URL(uuid) : null;
  const showImg = src && !failed;
  return (
    <span
      className={"av" + (showImg ? " av-img" : "")}
      style={{
        width: size, height: size, flex: "none", borderRadius: "var(--av-r)",
        display: "grid", placeItems: "center", overflow: "hidden",
        background: showImg ? "var(--paper2)" : `hsl(${h} 76% 58%)`,
        color: "hsl(" + h + " 62% 12%)",
        fontFamily: "Archivo,sans-serif", fontSize: Math.round(size * 0.38), fontWeight: 700,
        letterSpacing: "-0.02em",
      }}
    >
      {showImg ? (
        <img
          src={src} alt={name} loading="lazy" referrerPolicy="no-referrer"
          onError={() => {
            // Motion has no pfp for ~1 in 10 creators — try their official
            // social avatar once, then settle on the coloured monogram.
            if (!useFallback) setUseFallback(true);
            else setFailed(true);
          }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        initials
      )}
    </span>
  );
}

/* Desktop hover card: the avatar scales up and a details card drops beside it
   with rank, price and the creator's public links. Mobile keeps plain rows. */
function CreatorCell({ row, price, fiat, held, socials, onOpen, active }) {
  const [hot, setHot] = useState(false);
  const links = socialLinks(row.name, socials);
  return (
    <div
      className={"who hoverable" + (hot ? " hot" : "") + (active ? " active" : "")}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
    >
      <NameAvatar name={row.name} uuid={socials?.uuid} size={26} />
      <span className="nm">{row.name}</span>
      {held && <span className="tag">held</span>}

      <div className="hcard" role="tooltip">
        <div className="hcard-top">
          <div className="hcard-pfp">
            <NameAvatar name={row.name} uuid={socials?.uuid} size={96} />
          </div>
          <div className="hcard-id">
            <span className="hcard-rank num">rank #{row.position}</span>
            <h4>{row.name}</h4>
            <div className="hcard-px num">
              {fmt(price)} FLUENT
              <span>{fiat}</span>
            </div>
          </div>
        </div>
        <div className="hcard-links">
          {links.map((l) => (
            <a
              key={l.k} href={l.url} target="_blank" rel="noopener noreferrer nofollow"
              onClick={(e) => e.stopPropagation()}
            >
              <span className={"soc soc-" + l.k}>{l.label}</span>
              <span className="soc-h">{l.handle}</span>
              <Icon d={I.ext} width="11" height="11" />
            </a>
          ))}
        </div>
        <button className="hcard-cta" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
          open trade ticket →
        </button>
      </div>
    </div>
  );
}

function AddressModal({ address, onClose, onCopied }) {
  const [done, setDone] = useState(false);
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-h">
          <span>your fluent testnet address</span>
          <button className="modal-x" onClick={onClose} aria-label="close">×</button>
        </div>
        <p className="modal-p">
          Long-press or select the address, then paste it into the{" "}
          <a href={GAS_FAUCET_URL} target="_blank" rel="noopener noreferrer">Fluent faucet</a>.
        </p>
        <code className="modal-code" onClick={async (e) => {
          const sel = window.getSelection();
          const r = document.createRange();
          r.selectNodeContents(e.currentTarget);
          sel.removeAllRanges();
          sel.addRange(r);
          const ok = await copyText(address);
          if (ok) { setDone(true); onCopied?.(); }
        }}>{address}</code>
        <div className="modal-f">
          <button className="btn ghost" onClick={async () => {
            const ok = await copyText(address);
            setDone(ok);
            if (ok) onCopied?.();
          }}>{done ? "copied ✓" : "copy address"}</button>
          <a className="btn primary" href={GAS_FAUCET_URL} target="_blank" rel="noopener noreferrer"
             style={{ textAlign: "center", textDecoration: "none" }}>
            open faucet ↗
          </a>
        </div>
      </div>
    </div>
  );
}

const NAV = [
  { k: "feed", label: "Feed", icon: I.feed },
  { k: "markets", label: "Markets", icon: I.markets },
  { k: "portfolio", label: "Portfolio", icon: I.portfolio },
  { k: "settings", label: "Settings", icon: I.settings },
];

/* ------------------------------------------------------------------ terminal */

export function Terminal() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { address } = useAccount();
  const pub = usePublicClient();
  const { rows, loading, error, reload } = useBoard();
  const fluent = useFluent(address);
  const prices = usePrices();
  const trader = useTrader(address, reload);
  const holdingMap = useHoldings(address, rows, pub);
  const motion = useMotionMeta();
  const metaOf = useCallback((nm) => motion[(nm || "").trim().toLowerCase()] || null, [motion]);

  const [view, setView] = useState("markets");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [showAddr, setShowAddr] = useState(false);
  const [toast, setToast] = useState(null);
  const [units, setUnits] = useState(1);
  /* Currency is read after mount so the first client render matches the SSR
     markup exactly (localStorage during render is what causes hydration 418). */
  const [currency, setCurrency] = useState("USD");
  const [mounted, setMounted] = useState(false);
  const [showDrip, setShowDrip] = useState(false);
  useEffect(() => {
    setMounted(true);
    try {
      const c = localStorage.getItem("mm.currency");
      if (c) setCurrency(c);
    } catch { /* private mode */ }
  }, []);
  const pickCurrency = (c) => {
    setCurrency(c);
    try { localStorage.setItem("mm.currency", c); } catch { /* ignore */ }
  };

  const flash = useCallback((msg, isErr) => {
    setToast({ msg, isErr });
    setTimeout(() => setToast(null), 4600);
  }, []);

  const money = useMemo(() => makeMoney(prices.rates, currency), [prices.rates, currency]);
  const fiatOf = useCallback(
    (wei) => money(Number(prices.bySymbol.FLUENT || 0) * (Number(wei) / 1e18)),
    [money, prices.bySymbol.FLUENT]
  );
  const fiatEth = useCallback(
    (wei) => money(Number(prices.bySymbol.ETH || 0) * (Number(wei) / 1e18)),
    [money, prices.bySymbol.ETH]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(needle));
  }, [rows, q]);

  const sel = selected ? rows.find((r) => r.id === selected) : null;
  const selPrice = sel ? priceOf(sel.position) : 0n;
  const heldSel = sel ? holdingMap[sel.id]?.units ?? 0n : 0n;
  const qty = Math.max(1, Number(units) || 1);
  const cost = selPrice * BigInt(qty);
  const busy = trader.busy || fluent.busy;
  const dripAmount = fluent.drip || 5000n * 10n ** 18n;

  const wrapped = useCallback(async (fn, label) => {
    try {
      await fn();
      flash(label + " · confirmed", false);
    } catch (e) {
      flash((e.shortMessage || e.message || "failed").slice(0, 130), true);
    }
  }, [flash]);

  const onClaim = () => wrapped(async () => {
    try {
      await fluent.claim();
    } catch (e) {
      const msg = String(e?.shortMessage || e?.message || "");
      if (/funds|balance|gas|insufficient/i.test(msg)) {
        flash("no testnet ETH for gas — opening the Fluent faucet…", true);
        window.open(GAS_FAUCET_URL, "_blank", "noopener");
        throw e;
      }
      throw e;
    }
  }, `requested ${fmt(dripAmount, 0)} FLUENT`);

  const onRefill = () => wrapped(() => fluent.refill(), `requested ${fmt(dripAmount, 0)} FLUENT`);

  const onBuy = () => {
    if (!sel) return;
    wrapped(async () => {
      if (fluent.balance < cost) throw new Error(`not enough FLUENT for ${qty} unit${qty === 1 ? "" : "s"}`);
      await trader.buy(sel.id, BigInt(qty), cost);
      await fluent.refetch();
      await reload();
    }, `bought ${qty} × ${sel.name}`);
  };

  const onSell = (all = false) => {
    if (!sel) return;
    const want = all ? heldSel : BigInt(Math.min(qty, Number(heldSel)));
    wrapped(async () => {
      if (heldSel === 0n) throw new Error("no units to sell");
      await trader.sell(sel.id, want);
      await fluent.refetch();
      await reload();
    }, `sold ${want.toString()} × ${sel.name}`);
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

  const hero = (
    <section className="hero-block">
      <div className="hero-copy">
        <span className="kicker">motion leaderboard · fluent testnet</span>
        <h1>
          Attention is the asset.<br />Rank is the <i>price</i>.
        </h1>
        <p className="lede">
          Every creator on the Motion board is one share class and one number:
          <b> 1000 ÷ rank</b>. No order book, no pool, no slippage curve. They climb,
          your position is worth more; they slide, it isn’t. The board rebalances every
          few hours — and the market never closes on you.
        </p>
        <div className="hero-facts">
          <div><i>settled in</i><b>FLUENT</b></div>
          <div><i>drip from here</i><b>{fmt(dripAmount, 0)} / 12 h</b></div>
          <div><i>price model</i><b>1000 ÷ rank</b></div>
          <div><i>gas</i><b>testnet ETH</b></div>
        </div>
      </div>
      <div className="hero-side">
        <div className="tick num">
          <span>FLUENT / {currency}</span>
          <b>{money(prices.bySymbol.FLUENT)}</b>
          <em>{prices.source}</em>
        </div>
        <div className="tick num">
          <span>ETH / {currency}</span>
          <b>{money(prices.bySymbol.ETH)}</b>
          <em>coingecko</em>
        </div>
        <div className="tick num">
          <span>creators live</span>
          <b>{rows.length || "—"}</b>
          <em>synced onchain</em>
        </div>
      </div>
    </section>
  );

  return (
    <>
      <TopBar
        authed={authenticated}
        address={address}
        onLogout={logout}
        onDrip={() => setShowDrip(true)}
        dripBusy={fluent.busy}
        dripReady={fluent.canClaim && fluent.cooldownRemaining === 0}
      />

      {!ADDRESS && (
        <div className="banner">
          No contract address configured — set NEXT_PUBLIC_CONTRACT_ADDRESS and rebuild.
        </div>
      )}
      {error && <div className="banner">Board read failed: {error}</div>}

      {!authenticated ? (
        <>
          {hero}
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
        </>
      ) : (
        <div className="frame">
          <nav className="rail" aria-label="sections">
            <BrandMark />
            <div className="rail-group">
              {NAV.map((n) => (
                <button
                  key={n.k}
                  className={"rail-i" + (view === n.k ? " on" : "")}
                  onClick={() => setView(n.k)}
                  title={n.label}
                >
                  <Icon d={n.icon} width="17" height="17" />
                  <span>{n.label}</span>
                </button>
              ))}
            </div>

            <div className="rail-net">
              <span className="rail-lbl">net worth</span>
              <b className="num">{fmt(netWorth)}</b>
              <em className="num">{fiatOf(netWorth)}</em>
              <div className="rail-split num">
                <span>liquid {fmt(fluent.balance)}</span>
                <span>book {fmt(bookValue)}</span>
              </div>
            </div>

            <div className="rail-foot">
              {address && (
                <button className="rail-addr" onClick={() => setShowAddr(true)} title={address}>
                  <Icon d={I.copy} width="13" height="13" />
                  <span className="num">{address.slice(0, 6)}…{address.slice(-4)}</span>
                </button>
              )}
              <button className="rail-out" onClick={logout} title="Disconnect" aria-label="Disconnect">
                <Icon d={I.logout} width="15" height="15" />
              </button>
            </div>
          </nav>

          <main className="main">
            {view === "markets" && (
              <>
                {hero}

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
                        <th>{currency}</th>
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
                              <CreatorCell
                                row={r}
                                price={p}
                                fiat={fiatOf(p)}
                                held={Boolean(held)}
                                socials={metaOf(r.name)}
                                active={isSel}
                                onOpen={() => setSelected(r.id)}
                              />
                            </td>
                            <td className="price">{fmt(p)}</td>
                            <td className="num" style={{ color: "var(--mute)", fontSize: 11 }}>{fiatOf(p)}</td>
                            <td className={"chg " + (r.delta > 0 ? "u" : r.delta < 0 ? "d" : "f")}>
                              {r.delta === 0 ? "flat" : (r.delta > 0 ? "+" : "") + r.delta}
                            </td>
                            <td className="act">
                              <button
                                className="buy"
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
              </>
            )}

            {view === "portfolio" && (
              <section className="pane">
                <div className="pane-h">
                  <h2>Portfolio</h2>
                  <span className="num">{fiatOf(netWorth)}</span>
                </div>
                <div className="pane-grid">
                  <div className="pcard">
                    <i>net worth</i>
                    <b className="num">{fmt(netWorth)} FLUENT</b>
                    <em>{fiatOf(netWorth)}</em>
                  </div>
                  <div className="pcard">
                    <i>liquid</i>
                    <b className="num">{fmt(fluent.balance)} FLUENT</b>
                    <em>{fiatOf(fluent.balance)}</em>
                  </div>
                  <div className="pcard">
                    <i>in positions</i>
                    <b className="num">{fmt(bookValue)} FLUENT</b>
                    <em>{fiatOf(bookValue)}</em>
                  </div>
                  <div className="pcard">
                    <i>gas</i>
                    <b className="num">{fmt(fluent.ethBalance, 4)} {fluent.ethSymbol}</b>
                    <em>{fiatEth(fluent.ethBalance)}</em>
                  </div>
                </div>

                <div className="holdings big">
                  {holdings.length === 0 ? (
                    <div className="empty">
                      <b>Empty book.</b> Pick a creator and buy in. Price is 1000 ÷ rank, so climbing pays you.
                    </div>
                  ) : (
                    holdings.map((h) => (
                      <div key={h.id} className="hold" onClick={() => { setSelected(h.id); setView("markets"); }}>
                        <NameAvatar name={h.name} uuid={metaOf(h.name)?.uuid} size={28} />
                        <div className="meta">
                          <div className="nm">{h.name}</div>
                          <div className="qty">{h.units.toString()} u @ {fmt(priceOf(h.position))}</div>
                        </div>
                        <div>
                          <div className="val">{fmt(h.value)}</div>
                          <div style={{ color: "var(--mute)", fontSize: 11 }}>{fiatOf(h.value)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            {view === "feed" && (
              <section className="pane">
                <div className="pane-h"><h2>Feed</h2><span className="num">board deltas</span></div>
                <div className="feed">
                  {rows.slice(0, 40).map((r) => (
                    <div key={r.id} className="feed-row" onClick={() => { setSelected(r.id); setView("markets"); }}>
                      <span className="num rank">#{r.position}</span>
                      <NameAvatar name={r.name} uuid={metaOf(r.name)?.uuid} size={22} />
                      <span className="nm">{r.name}</span>
                      <span className={"chg " + (r.delta > 0 ? "u" : r.delta < 0 ? "d" : "f")}>
                        {r.delta === 0 ? "flat" : (r.delta > 0 ? "▲ +" : "▼ ") + r.delta}
                      </span>
                      <span className="num px">{fmt(priceOf(r.position))} F</span>
                    </div>
                  ))}
                  {rows.length === 0 && <div className="empty">nothing synced yet</div>}
                </div>
              </section>
            )}

            {view === "settings" && (
              <section className="pane">
                <div className="pane-h"><h2>Settings</h2><span className="num">saved in this browser</span></div>
                <div className="set-row">
                  <div>
                    <b>Display currency</b>
                    <p>Every fiat figure converts at the live rate.</p>
                  </div>
                  <select value={currency} onChange={(e) => pickCurrency(e.target.value)}>
                    {["USD", "IDR", "EUR", "GBP", "SGD", "JPY", "INR", "MYR", "AUD", "CNY"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="set-row">
                  <div>
                    <b>Wallet</b>
                    <p className="num">{address || "not connected"}</p>
                  </div>
                  <div className="set-acts">
                    <button className="btn ghost" onClick={() => setShowAddr(true)}>address</button>
                    <button className="btn ghost" onClick={logout}>
                      <Icon d={I.logout} width="14" height="14" /> disconnect
                    </button>
                  </div>
                </div>
                <div className="set-row">
                  <div>
                    <b>Contracts</b>
                    <p className="num">market {ADDRESS || "—"}</p>
                    <p className="num">token {TOKEN || "—"}</p>
                    <p className="num">faucet {FAUCET || "—"}</p>
                  </div>
                  <a className="btn ghost" href={`${EXPLORER}/address/${ADDRESS}`} target="_blank" rel="noreferrer">
                    fluentscan ↗
                  </a>
                </div>
                <div className="set-row">
                  <div>
                    <b>Rates</b>
                    <p>FLUENT {money(prices.bySymbol.FLUENT)} · ETH {money(prices.bySymbol.ETH)}</p>
                    <p className="num" style={{ fontSize: 11, color: "var(--mute)" }}>source: {prices.source}</p>
                  </div>
                </div>
              </section>
            )}
          </main>

          {(view === "markets" || view === "portfolio") && (
            <aside className="dealer">
              <div className="dealer-h">
                <span className="t">{sel ? "trade ticket" : "select a creator"}</span>
              </div>

              {sel ? (
                <>
                  <div className="tk-top">
                    <NameAvatar name={sel.name} uuid={metaOf(sel.name)?.uuid} size={44} />
                    <div>
                      <div className="tk-nm">{sel.name}</div>
                      <div className="tk-rank num">#{sel.position} · {fmt(selPrice)} FLUENT</div>
                      <div className="tk-fiat num">{fiatOf(selPrice)}</div>
                    </div>
                  </div>

                  <div className="tk-links">
                    {socialLinks(sel.name, metaOf(sel.name)).map((l) => (
                      <a key={l.k} href={l.url} target="_blank" rel="noopener noreferrer nofollow">
                        <span className={"soc soc-" + l.k}>{l.label}</span>
                        <span className="soc-h">{l.handle}</span>
                      </a>
                    ))}
                  </div>

                  <div className="qty-row">
                    <span>shares</span>
                    <div className="stepper">
                      <button onClick={() => setUnits((u) => Math.max(1, (Number(u) || 1) - 1))} aria-label="minus">−</button>
                      <input
                        type="number" min="1" step="1" value={units}
                        onChange={(e) => setUnits(e.target.value === "" ? "" : Math.max(1, Math.floor(Number(e.target.value))))}
                      />
                      <button onClick={() => setUnits((u) => (Number(u) || 1) + 1)} aria-label="plus">+</button>
                    </div>
                  </div>
                  <div className="qty-presets">
                    {[1, 5, 10, 25].map((n) => (
                      <button key={n} className={qty === n ? "on" : ""} onClick={() => setUnits(n)}>{n}</button>
                    ))}
                    <button
                      className="max"
                      onClick={() => {
                        const afford = selPrice > 0n ? Number(fluent.balance / selPrice) : 0;
                        setUnits(Math.max(1, afford));
                      }}
                      title="max affordable"
                    >max</button>
                  </div>

                  <div className="tk-sum">
                    <div><span>cost</span><b className="num">{fmt(cost)} F</b></div>
                    <div><span></span><em className="num">{fiatOf(cost)}</em></div>
                    <div><span>you hold</span><b className="num">{heldSel.toString()} u</b></div>
                  </div>

                  {!fluent.claimed ? (
                    <button className="btn primary" disabled={busy || !fluent.canClaim} onClick={onClaim}>
                      {fluent.busy ? "confirming…" : `claim ${fmt(dripAmount, 0)} FLUENT`}
                    </button>
                  ) : (
                    <div className="tk-acts">
                      <button
                        className="btn buy-b"
                        disabled={busy || fluent.balance < cost}
                        onClick={onBuy}
                      >
                        {trader.busy ? "confirming…" : `buy ${qty}`}
                      </button>
                      <button
                        className="btn sell-b"
                        disabled={busy || heldSel === 0n}
                        onClick={() => onSell(false)}
                      >
                        {heldSel === 0n ? "sell" : `sell ${Math.min(qty, Number(heldSel))}`}
                      </button>
                    </div>
                  )}
                  {heldSel > 0n && (
                    <button className="linkbtn" onClick={() => onSell(true)}>
                      close full position ({heldSel.toString()} u)
                    </button>
                  )}
                  {fluent.claimed && fluent.balance < cost && (
                    <div className="warn">
                      not enough FLUENT — <button className="linkbtn" onClick={onRefill}>request a drip</button>
                    </div>
                  )}
                  {trader.txError && <div className="warn err">{trader.txError}</div>}
                </>
              ) : (
                <div className="empty">click any row on the board to open its trade ticket</div>
              )}

              <div className="note">
                {fluent.lastTx && (
                  <a href={`${EXPLORER}/tx/${fluent.lastTx}`} target="_blank" rel="noreferrer">
                    last tx {String(fluent.lastTx).slice(0, 10)}…
                  </a>
                )}
              </div>
            </aside>
          )}
        </div>
      )}

      {authenticated && (
        <footer className="foot">
          <div className="foot-l">
            <BrandMark />
            <p>Paper reputational markets on the Motion leaderboard. Testnet only — no real funds.</p>
          </div>
          <div className="foot-r">
            <a href={`${EXPLORER}/address/${ADDRESS}`} target="_blank" rel="noreferrer">fluentscan ↗</a>
            <a href={GAS_FAUCET_URL} target="_blank" rel="noopener noreferrer">gas faucet ↗</a>
            <a href="https://leaderboard.motion.game" target="_blank" rel="noopener noreferrer">motion leaderboard ↗</a>
            <button className="linkbtn" onClick={logout}>disconnect</button>
          </div>
        </footer>
      )}

      {toast && <div className={"toast on" + (toast.isErr ? " err" : "")}>{toast.msg}</div>}
      {showAddr && address && (
        <AddressModal
          address={address}
          onClose={() => setShowAddr(false)}
          onCopied={() => flash("address copied — paste it into the Fluent faucet", false)}
        />
      )}
      {showDrip && (
        <DripModal
          fluent={fluent}
          dripAmount={dripAmount}
          money={money}
          onClose={() => setShowDrip(false)}
          onClaim={onClaim}
          onRefill={onRefill}
        />
      )}
    </>
  );
}

/* Top bar: brand left, faucet + disconnect icons right. The address is a plain
   label here — copying lives in the rail / address modal, not in the navbar. */
function TopBar({ authed, address, onLogout, onDrip, dripBusy, dripReady }) {
  return (
    <div className="top">
      <span className="top-l"><BrandMark /></span>
      <span className="top-r">
        {authed && address && (
          <span className="acct">
            {onDrip && (
              <button
                className={"icon-btn" + (dripReady ? " pulse" : "")}
                onClick={onDrip}
                disabled={dripBusy}
                title="Request testnet FLUENT"
                aria-label="Request testnet FLUENT"
              >
                <Icon d={I.drip} width="16" height="16" />
              </button>
            )}
            <span className="acct-addr num">{address.slice(0, 6)}…{address.slice(-4)}</span>
            <button className="icon-btn" onClick={onLogout} title="Disconnect" aria-label="Disconnect">
              <Icon d={I.logout} width="16" height="16" />
            </button>
          </span>
        )}
      </span>
    </div>
  );
}

function DripModal({ fluent, dripAmount, money, onClose, onClaim, onRefill }) {
  const ready = fluent.cooldownRemaining === 0;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-h">
          <span>testnet balances</span>
          <button className="modal-x" onClick={onClose} aria-label="close">×</button>
        </div>
        <div className="drip-grid">
          <div className="drip-card">
            <i>FLUENT · trading</i>
            <b className="num">{fmt(dripAmount, 0)}</b>
            <em>per request · 12 h cooldown · hold {fmt(fluent.balance)}</em>
            <button
              className="btn primary"
              disabled={fluent.busy || !ready || !fluent.canClaim}
              onClick={() => { onClaim(); onClose(); }}
            >
              {fluent.busy ? "confirming…" : ready ? "request FLUENT" : `next in ${hhmm(fluent.cooldownRemaining)}`}
            </button>
          </div>
          <div className="drip-card">
            <i>ETH · gas</i>
            <b className="num">{fmt(fluent.ethBalance, 4)}</b>
            <em>{fluent.ethSymbol} for transaction fees — official Fluent faucet</em>
            <a className="btn ghost" href={GAS_FAUCET_URL} target="_blank" rel="noopener noreferrer">
              open ETH faucet ↗
            </a>
          </div>
        </div>
        <p className="modal-p">
          Wallet holds <b className="num">{fmt(fluent.balance)} FLUENT</b>{" "}
          ({money(Number(fluent.balance) / 1e18 * 0.0476)}) and{" "}
          <b className="num">{fmt(fluent.ethBalance, 4)} {fluent.ethSymbol}</b>.{" "}
          <button className="linkbtn" onClick={onRefill}>refill tokens</button>
        </p>
      </div>
    </div>
  );
}

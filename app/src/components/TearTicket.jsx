"use client";

/*
 * Tear Ticket — ported from the Framer "Tear Ticket" component
 * (diligent-eyes-872902.framer.app).
 *
 * Anatomy of the original: a wide rounded ticket split into a light "body" and a
 * dark "stub". A vertical perforation line separates them, and two semicircular
 * notches are punched out of the ticket's top and bottom edges exactly on that
 * line — that's what sells the tear. The body carries a huge ghosted serif
 * watermark, a kicker row, a headline, a subtitle and a three-column footer; the
 * stub carries a small label, the big number, a sub-label and a barcode.
 *
 * Repurposed here as a creator trade receipt: body = which creator, side,
 * quantity and price; stub = the realised PnL, stamped by direction. The tear
 * interaction (click the stub) reveals the fill breakdown, in keeping with the
 * original's "tear to enter" affordance.
 */

import { useState } from "react";

const fmtNum = (n, d = 2) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
};

const shortAddr = (a) => (a && a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a || "—");

const dt = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

/**
 * @param {object} p
 * @param {"buy"|"sell"} [p.side="buy"]
 * @param {string} p.name       creator display name
 * @param {string} [p.handle]   @handle / uuid
 * @param {number} p.qty        shares
 * @param {number} p.price      execution price per share
 * @param {number} [p.pnl]      realised PnL in quote units (sell only)
 * @param {number} [p.pnlPct]   realised PnL percent
 * @param {string} [p.quote="$MOG"]
 * @param {string} [p.serial]   trade id / hash
 * @param {number} [p.when]     epoch ms
 * @param {string} [p.txHash]
 * @param {boolean} [p.realised]
 * @param {string} [p.watermark] big ghosted number (defaults to qty)
 * @param {boolean} [p.torn]     starts in the torn (detail) state
 */
export default function TearTicket({
  side = "buy",
  name = "Unknown creator",
  handle = "",
  qty = 0,
  price = 0,
  pnl = 0,
  pnlPct = 0,
  quote = "$MOG",
  serial = "",
  when = Date.now(),
  txHash = "",
  realised = true,
  watermark,
  torn = false,
  class: cls = "",
  onShare,
}) {
  const [open, setOpen] = useState(torn);
  const isSell = side === "sell";
  const up = Number(pnl) >= 0;
  const total = Number(qty) * Number(price);
  const mark =
    isSell && realised
      ? `${up ? "+" : "−"}${fmtNum(Math.abs(pnl), 2)} ${quote}`
      : `${fmtNum(qty, 2)} ${quote}`;
  const markSub = isSell && realised
    ? `${up ? "▲" : "▼"} ${fmtNum(Math.abs(pnlPct), 2)}% realised`
    : `${fmtNum(qty, 2)} @ ${fmtNum(price, 4)}`;

  return (
    <div className={`tk-wrap ${cls}`}>
      <div className={`tk ${open ? "is-torn" : ""} ${isSell ? "is-sell" : "is-buy"}`} data-side={side}>
        <span className="tk-perf" aria-hidden="true" />
        {/* ---- main body ---- */}
        <div className="tk-body">
          <span className="tk-mark" aria-hidden="true">{watermark ?? String(Math.round(Number(qty) || 0)).padStart(2, "0")}</span>

          <div className="tk-head">
            <span className="tk-kicker">
              <span className={`tk-pill tk-pill-${side}`}>{isSell ? "Sold" : "Bought"}</span>
              {handle ? <span className="tk-handle">@{String(handle).replace(/^@/, "")}</span> : null}
            </span>
            <span className="tk-serial">{serial || shortAddr(txHash)}</span>
          </div>

          <h3 className="tk-name">{name}</h3>
          <p className="tk-sub">
            {isSell
              ? `Closed a position of ${fmtNum(qty, 2)} shares at ${fmtNum(price, 4)} ${quote} each.`
              : `Opened a position of ${fmtNum(qty, 2)} shares at ${fmtNum(price, 4)} ${quote} each.`}
          </p>

          <div className="tk-cols">
            <div className="tk-col">
              <span className="tk-lab">Side</span>
              <span className="tk-val">{isSell ? "Sell" : "Buy"}</span>
            </div>
            <div className="tk-col">
              <span className="tk-lab">Qty</span>
              <span className="tk-val">{fmtNum(qty, 2)}</span>
            </div>
            <div className="tk-col">
              <span className="tk-lab">Price</span>
              <span className="tk-val">{fmtNum(price, 4)}</span>
            </div>
            <div className="tk-col">
              <span className="tk-lab">Notional</span>
              <span className="tk-val">{fmtNum(total, 2)} {quote}</span>
            </div>
          </div>

          {/* torn-away detail panel */}
          <div className="tk-detail" aria-hidden={!open}>
            <div className="tk-drow"><span>Executed</span><b>{dt(when)}</b></div>
            <div className="tk-drow"><span>Tx</span><b className="tk-mono">{shortAddr(txHash)}</b></div>
            <div className="tk-drow">
              <span>{isSell ? "Realised PnL" : "Cost basis"}</span>
              <b className={isSell ? (up ? "up" : "dn") : ""}>
                {isSell ? `${up ? "+" : "−"}${fmtNum(Math.abs(pnl), 2)} ${quote} (${fmtNum(Math.abs(pnlPct), 2)}%)` : `${fmtNum(total, 2)} ${quote}`}
              </b>
            </div>
            {onShare ? (
              <button type="button" className="tk-share" onClick={onShare}>
                Share this receipt ↗
              </button>
            ) : null}
          </div>
        </div>

        {/* ---- stub ---- */}
        <button
          type="button"
          className="tk-stub"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Fold the stub back" : "Tear the stub to reveal the receipt"}
          title={open ? "Fold back" : "Tear off"}
        >
          <span className="tk-stub-top">Admit one</span>
          <span className={`tk-stub-main ${isSell ? (up ? "up" : "dn") : ""}`}>{mark}</span>
          <span className="tk-stub-sub">{markSub}</span>
          <span className="tk-barcode" aria-hidden="true">
            {Array.from({ length: 26 }).map((_, i) => (
              <i key={i} style={{ flex: [1, 2, 1, 3][i % 4], opacity: i % 3 === 0 ? 1 : 0.72 }} />
            ))}
          </span>
          <span className="tk-tear">{open ? "Fold back ↺" : "Tear to view →"}</span>
        </button>
      </div>
    </div>
  );
}

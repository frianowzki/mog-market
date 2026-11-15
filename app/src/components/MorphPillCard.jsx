"use client";

/* Morph pill card — a port of the Framer "Morph Pill Card" component
   (grateful-encounter-200773.framer.app).

   Reference behaviour, measured off the live site: at rest it is one 40px
   avatar disc with the name beside it; on hover that same object becomes a
   165×243 card at 24px radius, the avatar stretches into a full-height image
   column and the profile fields slide in on the right.

   The critical detail is that it must be ONE element morphing, not two stacked
   states — so width/height/radius animate on a single container and the inner
   columns resize with it. That keeps the transition continuous and lets the
   card grow out of its own footprint instead of popping over the layout.

   Here it carries trading identity: rank, delta, price, and the buy action. */

import { useEffect, useRef, useState } from "react";

export default function MorphPillCard({
  img, name, rank, price, delta, bio, owner,
  onOpen, onTrade, className = "",
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const enter = () => { clearTimeout(closeTimer.current); setOpen(true); };
  const leave = () => { closeTimer.current = setTimeout(() => setOpen(false), 150); };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const up = Number(delta) > 0;
  const flat = Number(delta) === 0;

  return (
    <div className={`mpc-wrap${className ? " " + className : ""}`}>
      <button
        className={`mpc${open ? " open" : ""}`}
        onMouseEnter={enter}
        onMouseLeave={leave}
        onFocus={enter}
        onBlur={leave}
        onClick={() => (open ? onOpen?.() : setOpen(true))}
        aria-expanded={open}
        aria-label={`${name}, rank ${rank}`}
      >
        {/* the avatar: 40px disc at rest, full-height left column when open */}
        <span className="mpc-face" style={img ? { backgroundImage: `url(${img})` } : undefined}>
          {!img && <span className="mpc-initial">{String(name || "?").slice(0, 1)}</span>}
        </span>

        {/* the pill label, visible at rest only */}
        <span className="mpc-rest">{name}</span>

        {/* the reveal column */}
        <span className="mpc-info">
          <span className="mpc-top">
            <span className="mpc-rank num">rank #{rank}</span>
            <span className={`mpc-delta num ${up ? "up" : flat ? "flat" : "dn"}`}>
              {up ? "+" : ""}{Number(delta || 0).toFixed(1)}%
            </span>
          </span>

          <span className="mpc-name">{name}</span>
          {owner && <span className="mpc-owner">{owner}</span>}
          <span className="mpc-bio">{bio}</span>

          <span className="mpc-foot">
            <span className="mpc-price">
              <b className="num">{price}</b>
              <em>FLUENT / unit</em>
            </span>
            <span
              className="mpc-go"
              role="button"
              tabIndex={open ? 0 : -1}
              onClick={(e) => { e.stopPropagation(); onTrade?.(); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onTrade?.(); } }}
            >
              buy
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
            </span>
          </span>
        </span>
      </button>
    </div>
  );
}

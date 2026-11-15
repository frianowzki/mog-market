"use client";

/* Swatch accordion — a port of the Framer "Swatch Accordion" component
   (swatch-accordion.framer.website), re-purposed as the mobile creator deck.

   The reference is a row of vertical colour panels: only the active panel is
   wide, every other panel collapses into a narrow strip with rotated type.
   Here each panel is a creator card — collapsed it shows the rank number, the
   face, and a vertical name; expanded it lays the full bio, price, and buy
   action out horizontally.

   Desktop keeps the existing wide card interaction; this deck takes over below
   the mobile breakpoint where six equal cards would crush. Swipe is supported
   (pointer drag on the strip) and keyboard arrows step through the deck. */

import { useCallback, useEffect, useRef, useState } from "react";

export default function SwatchAccordion({
  items = [],
  defaultIndex = 0,
  onChange,
  className = "",
}) {
  const [active, setActive] = useState(defaultIndex);
  const stripRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => { setActive((a) => Math.min(a, Math.max(0, items.length - 1))); }, [items.length]);

  const pick = useCallback((i) => {
    setActive(i);
    onChange?.(i, items[i]);
  }, [items, onChange]);

  const step = (dir) => pick(Math.min(items.length - 1, Math.max(0, active + dir)));

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  };

  /* horizontal swipe: 42px of travel commits to the next/prev panel */
  const onPointerDown = (e) => {
    dragRef.current = { x: e.clientX, t: Date.now() };
  };
  const onPointerUp = (e) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) < 42) return;
    step(dx < 0 ? 1 : -1);
  };

  if (!items.length) return null;

  return (
    <div
      className={"swa" + (className ? " " + className : "")}
      ref={stripRef}
      role="tablist"
      aria-label="Creators"
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { dragRef.current = null; }}
      tabIndex={0}
    >
      {items.map((it, i) => {
        const on = i === active;
        return (
          <div
            key={it.id ?? i}
            className={"swa-panel" + (on ? " on" : "")}
            role="tab"
            aria-selected={on}
            aria-label={`${it.name}, rank ${it.rank}`}
            onClick={() => pick(i)}
          >
            {/* the image is the swatch */}
            <span className="swa-img" style={it.img ? { backgroundImage: `url(${it.img})` } : undefined} />
            <span className="swa-tint" style={{ "--tint": it.tint || "transparent" }} />
            <span className="swa-shade" />

            {/* collapsed: vertical name + rank */}
            <span className="swa-strip" aria-hidden={on}>
              <span className="swa-rank num">{String(it.rank).padStart(2, "0")}</span>
              <span className="swa-vname">{it.name}</span>
            </span>

            {/* expanded: full card body */}
            <span className="swa-body">
              <span className="swa-meta">
                <span className="swa-kicker num">rank #{it.rank}</span>
                <span className="swa-price num">{it.price}</span>
              </span>
              <span className="swa-name">{it.name}</span>
              <span className="swa-bio">{it.bio}</span>
              <span className="swa-tags">
                {(it.tags || []).map((t) => (
                  <span key={t} className="swa-tag">{t}</span>
                ))}
              </span>
              <span className="swa-acts">
                <button className="swa-buy" onClick={(e) => { e.stopPropagation(); it.onBuy?.(); }}>
                  buy
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
                </button>
                <span className="swa-nav">
                  <button onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="previous" disabled={active === 0}>←</button>
                  <button onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="next" disabled={active === items.length - 1}>→</button>
                </span>
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

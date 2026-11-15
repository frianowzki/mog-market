"use client";

/*
 * Expanded Card — ported from the Framer "Expanded Card" component
 * (glorious-rule-603893.framer.app).
 *
 * Anatomy: a horizontal band of cards. Exactly one is expanded (wide); the rest
 * collapse to narrow vertical strips. Each card carries a two-digit index in the
 * top-left, a full-bleed image, a bottom gradient scrim, and — only when
 * expanded — a description line, a title with an icon, and a round action button
 * on the right. Clicking a collapsed strip expands it and collapses the previous.
 *
 * Ported here as a controlled/uncontrolled accordion that takes arbitrary card
 * data, so the feed can feed it creator rows.
 */

import { useCallback, useEffect, useState } from "react";

/**
 * @param {object} p
 * @param {Array<{id:string,img?:string,index?:string,title:string,desc?:string,icon?:any,href?:string,onSelect?:Function,meta?:any}>} p.cards
 * @param {number} [p.height=440]
 * @param {number} [p.activeWidth]
 * @param {number} [p.collapsedWidth=64]
 * @param {number} [p.gap=10]
 * @param {number} [p.radius=18]
 * @param {string} [p.activeId]
 * @param {(id:string)=>void} [p.onChange]
 * @param {boolean} [p.autoplay=false]
 * @param {number} [p.interval=4500]
 */
export default function ExpandedCard({
  cards = [],
  height = 440,
  activeWidth,
  collapsedWidth = 64,
  gap = 10,
  radius = 18,
  activeId,
  onChange,
  autoplay = false,
  interval = 4500,
  class: cls = "",
}) {
  const [internal, setInternal] = useState(cards[0]?.id ?? null);
  const current = activeId !== undefined ? activeId : internal;

  const select = useCallback(
    (id) => {
      if (activeId === undefined) setInternal(id);
      onChange?.(id);
    },
    [activeId, onChange]
  );

  // autoplay: advance to the next card while the pointer is away
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!autoplay || paused || cards.length < 2) return undefined;
    const t = setInterval(() => {
      const i = cards.findIndex((c) => c.id === current);
      select(cards[(i + 1) % cards.length].id);
    }, interval);
    return () => clearInterval(t);
  }, [autoplay, paused, cards, current, interval, select]);

  return (
    <div
      className={"ec" + (cls ? " " + cls : "")}
      style={{ height, gap, "--ec-r": `${radius}px`, "--ec-collapsed": `${collapsedWidth}px` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {cards.map((c, i) => {
        const isOpen = c.id === current;
        return (
          <div
            key={c.id}
            className={"ec-card" + (isOpen ? " open" : "")}
            style={isOpen && activeWidth ? { flexBasis: activeWidth } : undefined}
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            onClick={() => {
              if (!isOpen) select(c.id);
              else c.onSelect?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!isOpen) select(c.id);
                else c.onSelect?.();
              }
            }}
          >
            {c.img ? (
              <img className="ec-img" src={c.img} alt={c.title || ""} loading={i < 2 ? "eager" : "lazy"} draggable="false" />
            ) : (
              <div className="ec-img ec-img-fallback" aria-hidden="true">{c.fallback || c.title?.slice(0, 2)}</div>
            )}
            <span className="ec-scrim" aria-hidden="true" />
            <span className="ec-idx">{c.index ?? String(i + 1).padStart(2, "0")}</span>

            <span className="ec-foot">
              <span className="ec-texts">
                {c.desc ? <span className="ec-desc">{c.desc}</span> : null}
                {c.title ? (
                  <span className="ec-title">
                    {c.icon ? <span className="ec-title-ico">{c.icon}</span> : null}
                    {c.title}
                  </span>
                ) : null}
                {c.meta ? <span className="ec-meta">{c.meta}</span> : null}
              </span>
              <span className="ec-act" aria-hidden={!isOpen}>
                {c.actionIcon ?? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                )}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Compact single-card variant — the collapsed strip look, always fully shown. */
export function ExpandedCardSolo({ img, index = "01", title, desc, meta, height = 300, radius = 18, onClick, fallback, class: cls = "" }) {
  return (
    <div
      className={"ec ec-solo" + (cls ? " " + cls : "")}
      style={{ height, "--ec-r": `${radius}px` }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="ec-card open">
        {img ? (
          <img className="ec-img" src={img} alt={title || ""} draggable="false" />
        ) : (
          <div className="ec-img ec-img-fallback" aria-hidden="true">{fallback || title?.slice(0, 2)}</div>
        )}
        <span className="ec-scrim" aria-hidden="true" />
        <span className="ec-idx">{index}</span>
        <span className="ec-foot">
          <span className="ec-texts">
            {desc ? <span className="ec-desc">{desc}</span> : null}
            {title ? <span className="ec-title">{title}</span> : null}
            {meta ? <span className="ec-meta">{meta}</span> : null}
          </span>
        </span>
      </div>
    </div>
  );
}

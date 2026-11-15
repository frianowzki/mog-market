"use client";

/* FAQs — a port of the Framer "FAQs" component (faq-component.framer.website).

   Reference behaviour: a two-column split — a sticky intro on the left, the
   question list on the right. Each row is a title with a small circular +/−
   chip on the right; opening a row reveals the answer with a height transition
   and rotates the chip into a cross/collapsed state. Single-open by default.

   Everything here is plain React + CSS: the height animation measures the
   answer node, so arbitrary content (paragraphs, links, lists) works. */

import { useEffect, useId, useRef, useState } from "react";

export default function Faq({
  items = [],
  eyebrow = "FAQ",
  title = "Questions, answered",
  intro = null,
  open = null,          // controlled key
  defaultOpenIndex = 0,
  allowMultiple = false,
  className = "",
}) {
  const [openSet, setOpenSet] = useState(() => new Set(
    defaultOpenIndex == null ? [] : [items[defaultOpenIndex]?.id ?? defaultOpenIndex],
  ));

  const isOpen = (it, i) => {
    if (open !== null && open !== undefined) return open === (it.id ?? i);
    return openSet.has(it.id ?? i);
  };

  const toggle = (it, i) => {
    const k = it.id ?? i;
    setOpenSet((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(k)) next.delete(k);
      else {
        if (!allowMultiple) next.clear();
        next.add(k);
      }
      return next;
    });
    it.onToggle?.(!isOpen(it, i));
  };

  return (
    <section className={"faq" + (className ? " " + className : "")} id="faq">
      <div className="faq-rail">
        <span className="faq-eyebrow">{eyebrow}</span>
        <h2 className="faq-title">{title}</h2>
        {intro && <p className="faq-intro">{intro}</p>}
      </div>

      <div className="faq-list">
        {items.map((it, i) => (
          <FaqRow
            key={it.id ?? i}
            item={it}
            index={i}
            open={isOpen(it, i)}
            onToggle={() => toggle(it, i)}
          />
        ))}
      </div>
    </section>
  );
}

function FaqRow({ item, index, open, onToggle }) {
  const bodyRef = useRef(null);
  const [h, setH] = useState(0);
  const id = useId();

  /* measure the answer so the transition can be a real height, not a guess —
     re-measures on resize and after fonts load, since both reflow the copy. */
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const measure = () => setH(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [item.a]);

  return (
    <div className={"faq-row" + (open ? " open" : "")}>
      <button
        className="faq-q"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
      >
        <span className="faq-idx">{String(index + 1).padStart(2, "0")}</span>
        <span className="faq-qt">{item.q}</span>
        <span className="faq-chip" aria-hidden="true">
          <span className="faq-bar h" />
          <span className="faq-bar v" />
        </span>
      </button>

      <div
        className="faq-a"
        id={id}
        role="region"
        style={{ height: open ? h : 0, opacity: open ? 1 : 0 }}
      >
        <div className="faq-a-inner" ref={bodyRef}>
          {typeof item.a === "string" ? <p>{item.a}</p> : item.a}
          {item.links?.length ? (
            <div className="faq-links">
              {item.links.map((l) => (
                <a key={l.href} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                  {l.label}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

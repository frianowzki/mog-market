"use client";

/* Liquid gooey nav — a port of the Framer "Liquid Gooey Nav" (orixcomponents)
   into a self-contained vanilla-React component.

   How the goo works: the pill is a real moving object. A blur+contrast filter
   is applied to the pill layer so the pill and the hover halo fuse into one
   liquid blob, and the labels sit on top with the filter inverted so they stay
   crisp. The active pill trails the pointer with a spring, and a thin highlight
   sweeps across it, which reads as surface tension.

   Props:
     items    [{ k, label, href? }]     — sections
     active   key                        — current section
     onChange (k) => void                — click handler
     accent   css colour                 — goo tint
     right    node                       — slot on the far right (CTA)
     compact  bool                       — icon-less, smaller pill (mobile)
*/

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function GooeyNav({
  items = [],
  active,
  onChange,
  accent = "#d7ff3e",
  right = null,
  brand = null,
  compact = false,
  className = "",
}) {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const itemRefs = useRef({});
  const [goo, setGoo] = useState({ x: 0, w: 0, ready: false });
  const [hover, setHover] = useState(null);
  const [drag, setDrag] = useState(false);

  /* measure the active item and slide the blob there — on mount, on change,
     and on resize. useLayoutEffect keeps it flash-free. */
  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current[active] || itemRefs.current[items[0]?.k];
      const track = trackRef.current;
      if (!el || !track) return;
      const a = el.getBoundingClientRect();
      const b = track.getBoundingClientRect();
      setGoo({ x: a.left - b.left, w: a.width, ready: true });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    /* fonts land after first paint — remeasure once they do */
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [active, items]);

  /* hover halo: a second, smaller goo dot that follows the cursor inside the
     track — it fuses with the pill through the blur filter. */
  const onMove = (e) => {
    const track = trackRef.current;
    if (!track) return;
    const b = track.getBoundingClientRect();
    setHover({ x: clamp(e.clientX - b.left, 0, b.width), y: clamp(e.clientY - b.top, 0, b.height) });
  };

  useEffect(() => {
    if (!drag) return;
    const up = () => setDrag(false);
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [drag]);

  return (
    <nav
      ref={wrapRef}
      className={"goo-nav" + (compact ? " compact" : "") + (className ? " " + className : "")}
      style={{ "--goo-acc": accent }}
      aria-label="Sections"
    >
      {brand && <span className="goo-brand">{brand}</span>}

      <div
        className="goo-track"
        ref={trackRef}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        onPointerDown={() => setDrag(true)}
      >
        {/* the filtered layer: anything in here melts together */}
        <span className="goo-liquid" aria-hidden="true">
          <span
            className={"goo-pill" + (goo.ready ? " in" : "")}
            style={{ transform: `translateX(${goo.x}px)`, width: goo.w }}
          >
            <span className="goo-sheen" />
          </span>
          {hover && (
            <span className="goo-dot" style={{ left: hover.x, top: hover.y }} />
          )}
        </span>

        {/* inverse-filter layer keeps labels sharp */}
        <span className="goo-labels">
          {items.map((it) => {
            const on = it.k === active;
            return (
              <button
                key={it.k}
                ref={(el) => { itemRefs.current[it.k] = el; }}
                type="button"
                className={"goo-item" + (on ? " on" : "")}
                onClick={() => onChange?.(it.k)}
                aria-current={on ? "page" : undefined}
              >
                {it.icon && <i className="goo-ico">{it.icon}</i>}
                <span>{it.label}</span>
              </button>
            );
          })}
        </span>
      </div>

      {right && <span className="goo-right">{right}</span>}
    </nav>
  );
}

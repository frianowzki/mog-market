"use client";

/*
 * Crest Gallery — ported from the Framer "Crest Gallery" component
 * (crest-gallery.framer.website).
 *
 * The original pins a section and, on scroll, sweeps a horizontal band of
 * portrait cards through 3D space. Cards sit on an arc: the one nearest the
 * centre of the viewport is upright and largest; as a card travels left or right
 * it rotates away on Y, drifts back on Z, dims and shrinks. That single
 * normalised offset (−1 … +1 from centre) drives every property, which is what
 * makes the band feel like one rotating crest rather than N independent cards.
 *
 * Ported as a self-contained horizontal scroller: the same transform maths, but
 * driven by the scroller's own scrollLeft so it works inside a page you can still
 * scroll normally, and it degrades to a plain snap-scroller without JS motion.
 */

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * @param {Array<{id:string,img?:string,title?:string,caption?:string,href?:string,onClick?:Function}>} p.items
 * @param {number} [p.height=460]     card height
 * @param {number} [p.width=300]      card width
 * @param {number} [p.gap=28]
 * @param {number} [p.rotate=26]      max Y rotation at the edges, deg
 * @param {number} [p.depth=140]      push-back at the edges, px
 * @param {number} [p.radius=16]
 * @param {boolean} [p.labels=true]
 */
export default function CrestGallery({
  items = [],
  height = 460,
  width = 300,
  gap = 28,
  rotate = 26,
  depth = 140,
  radius = 16,
  labels = true,
  class: cls = "",
}) {
  const track = useRef(null);
  const [ready, setReady] = useState(false);

  const layout = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const cards = el.querySelectorAll(".cg-card");
    if (!cards.length) return;

    /* Clear our own transforms first: getBoundingClientRect includes any rotation
       we wrote on the previous frame, so measuring without resetting compounds.
       One synchronous reset, then read every rect, then write — cheap at this
       card count and always correct. */
    cards.forEach((c) => { c.style.transform = "none"; });

    const box = el.getBoundingClientRect();

    /* First pass: collect centres with transforms cleared. Normalising against
       the furthest card (not half the viewport) keeps the arc full-range no
       matter how many cards there are or how wide the viewport gets. */
    const rects = [];
    cards.forEach((card) => {
      const r = card.getBoundingClientRect();
      rects.push(r.left + r.width / 2);
    });
    const mid = (box.left + box.width / 2);
    const reach = Math.max(1, ...rects.map((c) => Math.abs(c - mid)));

    cards.forEach((card, i) => {
      const t = Math.max(-1, Math.min(1, (rects[i] - mid) / reach));
      const a = Math.abs(t);
      const ry = -t * rotate;
      const z = -a * depth;
      const scale = 1 - a * 0.16;
      const y = a * a * 26;          // edges dip down slightly → arc
      card.style.transform = `translate3d(0, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${ry.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      card.style.opacity = String(1 - a * 0.45);
      card.style.zIndex = String(100 - Math.round(a * 90));
      card.style.filter = `saturate(${(1 - a * 0.45).toFixed(3)}) brightness(${(1 - a * 0.22).toFixed(3)})`;
    });
  }, [rotate, depth]);

  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;

    /* Centre the band, then paint. The scroll assignment must land before the
       first layout() or every card measures as if the track were at scroll 0,
       and images that resolve later shift offsetLeft — so we repaint on load too. */
    const paint = () => {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
      layout();
    };

    paint();
    setReady(true);

    // repaint once fonts/images settle (offsetLeft changes when a card grows)
    const raf1 = requestAnimationFrame(paint);
    const t1 = setTimeout(paint, 120);
    const t2 = setTimeout(paint, 600);

    const imgs = el.querySelectorAll("img");
    const onLoad = () => layout();
    imgs.forEach((i) => {
      if (!i.complete) i.addEventListener("load", onLoad, { once: true });
    });

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        layout();
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", paint);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", paint);
      imgs.forEach((i) => i.removeEventListener("load", onLoad));
      cancelAnimationFrame(raf1);
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [layout]);

  const nudge = (dir) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * (width + gap + 60), behavior: "smooth" });
  };

  return (
    <div className={"cg" + (cls ? " " + cls : "")} style={{ "--cg-h": `${height}px`, "--cg-w": `${width}px`, "--cg-gap": `${gap}px`, "--cg-r": `${radius}px` }}>
      <div className="cg-track" ref={track} data-ready={ready ? "yes" : "no"}>
        {items.map((it) => {
          const Tag = it.href ? "a" : "button";
          return (
            <Tag
              key={it.id}
              className="cg-card"
              href={it.href}
              type={it.href ? undefined : "button"}
              onClick={it.onClick}
            >
              <span className="cg-frame">
                {it.img ? (
                  <img src={it.img} alt={it.title || ""} loading="lazy" draggable="false" />
                ) : (
                  <span className="cg-fallback" aria-hidden="true">{(it.title || "?").slice(0, 2)}</span>
                )}
                <span className="cg-shine" aria-hidden="true" />
              </span>
              {labels && (it.title || it.caption) ? (
                <span className="cg-cap">
                  {it.title ? <span className="cg-t">{it.title}</span> : null}
                  {it.caption ? <span className="cg-c">{it.caption}</span> : null}
                </span>
              ) : null}
            </Tag>
          );
        })}
      </div>

      <div className="cg-nav">
        <button type="button" className="cg-btn" onClick={() => nudge(-1)} aria-label="Previous">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <span className="cg-hint">drag or scroll the crest</span>
        <button type="button" className="cg-btn" onClick={() => nudge(1)} aria-label="Next">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}

"use client";

/* Text motion pack — a port of the Framer "Text Motion Pack" component
   (6 triggers, 37 presets, full typography control) as a dependency-free
   React component.

   The pack exposes one primitive, <TextMotion>, plus ready-made wrappers for
   the presets this site actually uses:

     TextMotion   — per-character/word/line animation with 20 presets
     SplitText    — small helper for headline splits (char | word | line)
     CountUp      — number that counts when it scrolls into view
     TypeLines    — typewriter reveal per line
     ScrambleText — decode/scramble reveal

   Everything runs off IntersectionObserver + CSS transitions, so there is no
   animation library, no layout thrash, and prefers-reduced-motion is honoured
   (text lands at its final state instantly). */

import { useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------- presets ---- */

/* Each preset returns the inline style for a unit at state `on` (settled) or
   `off` (initial). `i` is the unit index, `n` the unit count, `stagger` the ms
   delay between units. */
const PRESETS = {
  "fade":          { from: { opacity: 0 },                       to: { opacity: 1 } },
  "fade-up":       { from: { opacity: 0, y: 18 },                to: { opacity: 1, y: 0 } },
  "fade-down":     { from: { opacity: 0, y: -18 },               to: { opacity: 1, y: 0 } },
  "fade-left":     { from: { opacity: 0, x: 22 },                to: { opacity: 1, x: 0 } },
  "fade-right":    { from: { opacity: 0, x: -22 },               to: { opacity: 1, x: 0 } },
  "blur-in":       { from: { opacity: 0, blur: 12 },             to: { opacity: 1, blur: 0 } },
  "blur-up":       { from: { opacity: 0, blur: 10, y: 22 },      to: { opacity: 1, blur: 0, y: 0 } },
  "rise":          { from: { y: "108%", rot: 4 },                to: { y: "0%", rot: 0 }, mask: true },
  "drop":          { from: { y: "-108%", rot: -4 },              to: { y: "0%", rot: 0 }, mask: true },
  "flip-x":        { from: { rotX: -92, opacity: 0 },            to: { rotX: 0, opacity: 1 }, perspective: 700 },
  "flip-y":        { from: { rotY: -92, opacity: 0 },            to: { rotY: 0, opacity: 1 }, perspective: 700 },
  "scale-in":      { from: { scale: 0.72, opacity: 0 },          to: { scale: 1, opacity: 1 } },
  "scale-out":     { from: { scale: 1.28, opacity: 0 },          to: { scale: 1, opacity: 1 } },
  "swing":         { from: { rotZ: -9, y: 12, opacity: 0 },      to: { rotZ: 0, y: 0, opacity: 1 } },
  "slide-mask":    { from: { y: "100%" },                        to: { y: "0%" }, mask: true },
  "letter-drift":  { from: { opacity: 0, y: 10, rot: 6, scale: 0.9 }, to: { opacity: 1, y: 0, rot: 0, scale: 1 } },
  "weight-in":     { from: { opacity: 0, blur: 6, tracking: "0.22em" }, to: { opacity: 1, blur: 0, tracking: "inherit" } },
  "glow-in":       { from: { opacity: 0, blur: 14, scale: 1.06 },  to: { opacity: 1, blur: 0, scale: 1 } },
  "skew-in":       { from: { opacity: 0, skew: 12, x: -14 },      to: { opacity: 1, skew: 0, x: 0 } },
  "none":          { from: {},                                     to: {} },
};

export const PRESET_NAMES = Object.keys(PRESETS);

const EASE = {
  smooth: "cubic-bezier(.22,.68,0,1)",
  soft: "cubic-bezier(.32,.72,0,1)",
  snap: "cubic-bezier(.3,1.4,.5,1)",
  linear: "linear",
};

function unitStyle(preset, phase, i, stagger, delay) {
  const p = PRESETS[preset] || PRESETS["fade-up"];
  const v = phase === "on" ? p.to : p.from;
  const s = {
    opacity: 1,
    transform: "none",
    filter: "none",
    transitionDelay: `${delay + i * stagger}ms`,
  };
  if (v.opacity !== undefined) s.opacity = v.opacity;
  const t = [];
  if (v.x !== undefined) t.push(`translateX(${typeof v.x === "number" ? v.x + "px" : v.x})`);
  if (v.y !== undefined) t.push(`translateY(${typeof v.y === "number" ? v.y + "px" : v.y})`);
  if (v.scale !== undefined) t.push(`scale(${v.scale})`);
  if (v.rot !== undefined) t.push(`rotate(${v.rot}deg)`);
  if (v.rotX !== undefined) t.push(`rotateX(${v.rotX}deg)`);
  if (v.rotY !== undefined) t.push(`rotateY(${v.rotY}deg)`);
  if (v.skew !== undefined) t.push(`skewX(${v.skew}deg)`);
  if (t.length) s.transform = t.join(" ");
  if (v.blur !== undefined) s.filter = `blur(${v.blur}px)`;
  if (v.tracking !== undefined) s.letterSpacing = v.tracking;
  if (p.perspective) s.transformPerspective = `${p.perspective}px`;
  return s;
}

/* ----------------------------------------------------------------- core ---- */

export default function TextMotion({
  children,
  preset = "fade-up",
  split = "word",          // char | word | line
  stagger = 42,            // ms between units
  delay = 0,
  duration = 780,
  ease = "smooth",
  trigger = "view",        // view | mount | hover | loop | scroll | none
  loopEvery = 3800,
  as: Tag = "span",
  className = "",
  style,
  ...rest
}) {
  const ref = useRef(null);
  const [on, setOn] = useState(trigger === "none");
  const [hovered, setHovered] = useState(false);
  const reduced = usePrefersReduced();

  const text = typeof children === "string" ? children : null;
  const units = useMemo(() => {
    if (text == null) return null;
    if (split === "char") return Array.from(text);
    if (split === "line") return text.split("\n");
    return text.split(/(\s+)/).filter((s) => s.length > 0);
  }, [text, split]);

  /* one observer per component: settle once, unless the trigger is a loop */
  useEffect(() => {
    const el = ref.current;
    if (!el || trigger === "none" || trigger === "mount" || trigger === "hover") return;
    if (reduced) { setOn(true); return; }
    if (trigger === "loop") {
      let t1, t2;
      const cycle = () => {
        setOn(false);
        t1 = setTimeout(() => setOn(true), 60);
        t2 = setTimeout(cycle, loopEvery);
      };
      cycle();
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setOn(true); io.disconnect(); }
      },
      { threshold: trigger === "scroll" ? 0.05 : 0.25, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [trigger, loopEvery, reduced]);

  useEffect(() => {
    if (trigger === "mount") {
      const id = requestAnimationFrame(() => setOn(true));
      return () => cancelAnimationFrame(id);
    }
    if (trigger === "none") setOn(true);
  }, [trigger]);

  const active = trigger === "hover" ? hovered : on;
  const p = PRESETS[preset] || PRESETS["fade-up"];
  const trans = `opacity ${duration}ms ${EASE[ease]}, transform ${duration}ms ${EASE[ease]}, filter ${duration}ms ${EASE[ease]}, letter-spacing ${duration}ms ${EASE[ease]}`;

  const handlers = trigger === "hover"
    ? { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) }
    : {};

  if (!units) {
    /* non-string children: animate the block as a single unit */
    return (
      <Tag
        ref={ref}
        className={className}
        style={{ display: "inline-block", transition: trans, ...unitStyle(preset, active ? "on" : "off", 0, stagger, delay), ...style }}
        {...handlers}
        {...rest}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ display: "inline-block", ...style }}
      aria-label={text}
      {...handlers}
      {...rest}
    >
      {units.map((u, i) => {
        if (/^\s+$/.test(u)) return <span key={i} aria-hidden="true"> </span>;
        const s = unitStyle(preset, active ? "on" : "off", i, stagger, delay);
        s.transition = trans;
        s.display = "inline-block";
        s.whiteSpace = split === "line" ? "pre-wrap" : "pre";
        if (split === "line") { s.display = "block"; s.whiteSpace = "pre"; }
        if (p.mask) {
          return (
            <span
              key={i}
              aria-hidden="true"
              style={{ display: split === "line" ? "block" : "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
            >
              <span style={s}>{u}</span>
            </span>
          );
        }
        return <span key={i} aria-hidden="true" style={s}>{u}</span>;
      })}
    </Tag>
  );
}

/* --------------------------------------------------------- count-up ---- */

/* Counter that eases to `to` when it enters the viewport. Presets:
   digit (each digit rolls), plain (whole number ticks). */
export function CountUp({
  to = 0, from = 0, duration = 1400, decimals = 0, prefix = "", suffix = "",
  className = "", style, separator = "",
}) {
  const [val, setVal] = useState(from);
  const ref = useRef(null);
  const reduced = usePrefersReduced();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) { setVal(to); return; }
    let raf;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - k, 3);
        setVal(from + (to - from) * eased);
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, from, duration, reduced]);

  const shown = val.toLocaleString("en-US", {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  });
  const spaced = separator ? shown.replace(/,/g, separator) : shown;
  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {prefix}{spaced}{suffix}
    </span>
  );
}

/* ------------------------------------------------------- scramble ---- */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$";

export function ScrambleText({ text = "", duration = 900, className = "", style, as: Tag = "span" }) {
  const [out, setOut] = useState(text);
  const ref = useRef(null);
  const reduced = usePrefersReduced();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) { setOut(text); return; }
    let raf, t0, io;
    const run = () => {
      t0 = performance.now();
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / duration);
        const solid = Math.floor(text.length * k);
        let s = text.slice(0, solid);
        for (let i = solid; i < text.length; i++) {
          s += text[i] === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setOut(s);
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { io.disconnect(); run(); }
    }, { threshold: 0.3 });
    io.observe(el);
    setOut(text.replace(/[^\s]/g, (c) => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]));
    return () => { io?.disconnect(); cancelAnimationFrame(raf); };
  }, [text, duration, reduced]);

  return <Tag ref={ref} className={className} style={style} aria-label={text}>{out}</Tag>;
}

/* ------------------------------------------------------- typewriter ---- */

export function TypeLines({ lines = [], speed = 26, gap = 260, className = "", style }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const reduced = usePrefersReduced();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) { setN(lines.length); return; }
    let io, t;
    let idx = 0;
    const step = () => {
      idx += 1;
      setN(idx);
      if (idx < lines.length) t = setTimeout(step, gap);
    };
    io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { io.disconnect(); t = setTimeout(step, 120); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => { io?.disconnect(); clearTimeout(t); };
  }, [lines, gap, reduced]);

  return (
    <span ref={ref} className={className} style={{ display: "block", ...style }}>
      {lines.map((l, i) => (
        <span key={i} style={{ display: "block", opacity: i < n ? 1 : 0, transform: i < n ? "none" : "translateY(8px)", transition: `opacity ${speed * 12}ms ease, transform ${speed * 12}ms ease` }}>
          {l}
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------- reduced motion ---- */

function usePrefersReduced() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

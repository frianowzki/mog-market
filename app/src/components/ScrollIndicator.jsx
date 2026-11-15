"use client";

/* Scroll indicator — a port of the Framer "Scroll Indicator" component
   (scrollindicatorx.framer.website).

   Reference: a mouse outline with a wheel dot that travels down inside it, a
   pair of stacked chevrons that pulse, and the word SCROLL with a blinking
   caret. It sits with the content and disappears once the reader has scrolled.

   This port keeps that vocabulary and adds the thing a page like this actually
   needs: a real progress read-out. The caret blinks by CSS, the wheel dot
   travels by CSS, but the fill and the percentage come from live scroll
   position, and the whole thing fades out as soon as you leave the top.

   Props:
     target  — selector/element to measure (default: the scroll container/window)
     label   — the word shown next to the arrows
     showPct — render the live percentage
*/

import { useEffect, useState } from "react";

export default function ScrollIndicator({
  target,
  label = "scroll",
  showPct = true,
  className = "",
}) {
  const [pct, setPct] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = typeof target === "string"
      ? (typeof document !== "undefined" ? document.querySelector(target) : null)
      : target || null;

    const read = () => {
      let done;
      if (el) {
        const max = el.scrollHeight - el.clientHeight;
        done = max > 0 ? el.scrollTop / max : 0;
      } else {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        done = max > 0 ? window.scrollY / max : 0;
      }
      setPct(Math.max(0, Math.min(1, done)));
      setHidden(done > 0.035);
    };

    read();
    const src = el || window;
    src.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      src.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [target]);

  return (
    <div
      className={`sci${hidden ? " gone" : ""}${className ? " " + className : ""}`}
      aria-hidden="true"
    >
      {/* mouse: outline + travelling wheel dot */}
      <span className="sci-mouse">
        <span className="sci-wheel" />
      </span>

      {/* chevrons */}
      <span className="sci-chev">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </span>

      <span className="sci-word">
        {label}
        <i className="sci-caret" />
      </span>

      {showPct && (
        <span className="sci-pct">
          <span className="sci-bar"><span className="sci-fill" style={{ transform: `scaleX(${pct})` }} /></span>
          <span className="num">{String(Math.round(pct * 100)).padStart(2, "0")}%</span>
        </span>
      )}
    </div>
  );
}

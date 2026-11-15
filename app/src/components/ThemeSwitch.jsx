"use client";

/* Theme switch — a port of the Framer "Theme Changer" component's switch
   variant (themechanger.framer.website): a pill track with one white thumb
   that carries a sun or moon glyph and slides across.

   The reference exposes a segmented control and a switch; only the switch is
   ported here, because the app already has a two-state model (`useTheme`).
   The thumb glyph crossfades rather than swapping abruptly, and the track tint
   follows the resolved theme, so the control reads correctly in both modes. */

import { useEffect, useState } from "react";

const Sun = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const Moon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
    <path d="M20.4 14.6A8.5 8.5 0 0 1 9.4 3.6a8.5 8.5 0 1 0 11 11Z" />
  </svg>
);

export default function ThemeSwitch({
  mode = "dark",           // "dark" | "light"
  onChange,
  size = "md",             // md | sm
  label = true,
  className = "",
}) {
  const isDark = mode === "dark";
  const [pulse, setPulse] = useState(false);

  /* a 220ms squeeze on the thumb when it flips — the reference trick that makes
     the switch feel physical without a spring library */
  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 220);
    return () => clearTimeout(t);
  }, [isDark]);

  return (
    <button
      type="button"
      className={`tsw${isDark ? " dark" : " light"}${size === "sm" ? " sm" : ""}${pulse ? " pulse" : ""}${className ? " " + className : ""}`}
      onClick={() => onChange?.(isDark ? "light" : "dark")}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "switch to light mode" : "switch to dark mode"}
      title={isDark ? "light mode" : "dark mode"}
    >
      <span className="tsw-track" aria-hidden="true">
        <span className="tsw-ico sun">{<Sun />}</span>
        <span className="tsw-ico moon">{<Moon />}</span>
      </span>
      <span className="tsw-thumb" aria-hidden="true">
        <span className="tsw-glyph">{isDark ? <Moon /> : <Sun />}</span>
      </span>
      {label && <span className="tsw-lbl">{isDark ? "dark" : "light"}</span>}
    </button>
  );
}

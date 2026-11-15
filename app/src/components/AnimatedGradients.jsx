"use client";

/* 3 animated gradients — a port of the Framer "3 Animated Gradients" component
   (threegradients.framer.website).

   The reference ships three presets (Noise / Lava-Liquid / Holo), each a set of
   soft radial colour fields that drift and morph, with a fine grain film laid
   over the top to kill banding.

   This port keeps all three presets and picks them by prop, but renders them as
   pure CSS layers with a shared WebGL-free drift loop, because the app already
   runs a lot on the main thread and a canvas would compete with the charts.
   The grain is an inline SVG feTurbulence so there is no image to download.

   Props:
     variant: "noise" | "lava" | "holo"   — palette
     intensity: 0..1                      — overall opacity of the fields
     speed: seconds for one drift cycle
     grain: bool                          — film grain overlay
*/

import { useMemo } from "react";

const PRESETS = {
  /* muted ink + lime: reads as data surface, not a marketing hero */
  noise: [
    "radial-gradient(60% 55% at 18% 12%, rgba(215,255,62,0.30) 0%, transparent 62%)",
    "radial-gradient(52% 48% at 84% 22%, rgba(70,120,255,0.26) 0%, transparent 64%)",
    "radial-gradient(64% 60% at 62% 92%, rgba(255,120,180,0.20) 0%, transparent 62%)",
    "radial-gradient(46% 44% at 8% 82%, rgba(0,190,190,0.18) 0%, transparent 66%)",
  ],
  lava: [
    "radial-gradient(58% 54% at 22% 20%, rgba(255,90,40,0.34) 0%, transparent 60%)",
    "radial-gradient(54% 50% at 80% 32%, rgba(255,40,120,0.28) 0%, transparent 62%)",
    "radial-gradient(66% 62% at 55% 96%, rgba(255,170,30,0.24) 0%, transparent 64%)",
    "radial-gradient(44% 42% at 12% 88%, rgba(180,20,60,0.22) 0%, transparent 66%)",
  ],
  holo: [
    "radial-gradient(56% 52% at 20% 16%, rgba(120,200,255,0.34) 0%, transparent 60%)",
    "radial-gradient(54% 52% at 82% 26%, rgba(190,120,255,0.28) 0%, transparent 62%)",
    "radial-gradient(62% 58% at 58% 94%, rgba(255,120,220,0.24) 0%, transparent 64%)",
    "radial-gradient(42% 40% at 10% 84%, rgba(90,160,255,0.22) 0%, transparent 66%)",
  ],
};

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.42'/%3E%3C/svg%3E\")";

export default function AnimatedGradients({
  variant = "noise",
  intensity = 1,
  speed = 26,
  grain = true,
  className = "",
}) {
  const layers = useMemo(() => PRESETS[variant] || PRESETS.noise, [variant]);

  return (
    <div
      className={`agr agr-${variant}${className ? " " + className : ""}`}
      aria-hidden="true"
      style={{ "--agr-speed": `${speed}s`, "--agr-op": intensity }}
    >
      {/* three fields, each drifting on its own curve so the blend never
          repeats visibly — the 4th layer rides at a different rate */}
      <span className="agr-field f1" style={{ backgroundImage: layers[0] }} />
      <span className="agr-field f2" style={{ backgroundImage: layers[1] }} />
      <span className="agr-field f3" style={{ backgroundImage: layers[2] }} />
      <span className="agr-field f4" style={{ backgroundImage: layers[3] }} />
      {grain && <span className="agr-grain" style={{ backgroundImage: GRAIN }} />}
    </div>
  );
}

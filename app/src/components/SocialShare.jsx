"use client";

/*
 * Sleek Social Share — ported from the Framer "Sleek Social Share" component
 * (jolly-course-711532.framer.app). Kept behaviourally identical: a row of icon
 * buttons, each with a brand colour, an outline / monochrome / brand fill style,
 * a hover-arrow effect (scale | glow | slide | press), an optional tooltip, and
 * a copy-link button that flips to a check for 2s.
 *
 * Differences from the Framer original: no Framer motion dependency (CSS
 * transitions drive the same springs closely enough), and the "Twitter"
 * network is presented as X because that's the brand today.
 */

import { useCallback, useEffect, useRef, useState } from "react";

const ICONS = {
  twitter:
    "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452z",
  facebook:
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  whatsapp:
    "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.465 3.488",
  email:
    "M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.91L12 10.09l9.455-6.269h.909c.904 0 1.636.732 1.636 1.636z",
  copylink:
    "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",
  check: "M20 6 9 17l-5-5",
};

const NETWORKS = [
  { key: "twitter", name: "X", color: "#000000" },
  { key: "linkedin", name: "LinkedIn", color: "#0A66C2" },
  { key: "facebook", name: "Facebook", color: "#1877F2" },
  { key: "whatsapp", name: "WhatsApp", color: "#25D366" },
  { key: "email", name: "Email", color: "#EA4335" },
  { key: "copylink", name: "Copy Link", color: "#6B7280" },
];

const DEFAULT_ORDER = NETWORKS.map((n) => n.key);

/**
 * @param {object} p
 * @param {string} p.url    — what gets shared
 * @param {string} p.title  — text/tweet body
 * @param {number} [p.size=40]        — button edge in px
 * @param {string} [p.style="brand"]  — brand | outline | monochrome
 * @param {string} [p.effect="scale"] — scale | glow | slide | press
 * @param {boolean} [p.tooltips=true]
 * @param {number} [p.gap=10]
 * @param {string} [p.align="center"] — left | center | right
 * @param {string[]} [p.networks]     — subset/reorder of the keys above
 */
export default function SocialShare({
  url = "",
  title = "",
  size = 40,
  style = "brand",
  effect = "scale",
  tooltips = true,
  gap = 10,
  align = "center",
  networks = DEFAULT_ORDER,
  className = "",
  neutralColor = "#1c1c1c",
  label,
}) {
  const [hovered, setHovered] = useState(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const radius = Math.round(size * 0.2);

  const shareUrl = useCallback(() => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  }, [url]);

  const open = (u) => {
    if (typeof window === "undefined") return;
    window.open(u, "_blank", "noopener,noreferrer");
  };

  const copy = async () => {
    const target = shareUrl();
    if (!target || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked — user can still copy from the address bar */ }
  };

  const act = (key) => {
    const u = encodeURIComponent(shareUrl());
    const t = encodeURIComponent(title || (typeof document !== "undefined" ? document.title : ""));
    switch (key) {
      case "twitter": return open(`https://twitter.com/intent/tweet?text=${t}&url=${u}`);
      case "linkedin": return open(`https://www.linkedin.com/sharing/share-offsite/?url=${u}`);
      case "facebook": return open(`https://www.facebook.com/sharer/sharer.php?u=${u}`);
      case "whatsapp": return open(`https://wa.me/?text=${t}%20${u}`);
      case "email": return open(`mailto:?subject=${t}&body=${u}`);
      case "copylink": return copy();
      default: return undefined;
    }
  };

  const paint = (color) => {
    if (style === "monochrome") return { background: neutralColor, color: "#ffffff", border: "2px solid transparent" };
    if (style === "outline") return { background: "transparent", color, border: `2px solid ${color}` };
    return { background: color, color: "#ffffff", border: "2px solid transparent" };
  };

  const flex = align === "right" ? "flex-end" : align === "left" ? "flex-start" : "center";

  return (
    <div className={"ss" + (className ? " " + className : "")} data-effect={effect}>
      {label ? <span className="ss-lbl">{label}</span> : null}
      <div className="ss-row" style={{ gap, justifyContent: flex }}>
        {networks.map((key) => {
          const net = NETWORKS.find((n) => n.key === key);
          if (!net) return null;
          const on = hovered === key;
          const done = key === "copylink" && copied;
          const accent = style === "monochrome" ? neutralColor : net.color;
          return (
            <div key={key} className="ss-slot" style={{ width: size, height: size }}>
              {effect === "glow" && on && (
                <span
                  aria-hidden="true"
                  className="ss-glow"
                  style={{
                    width: size * 1.5,
                    height: size * 1.5,
                    borderRadius: radius + 8,
                    background: `radial-gradient(circle, ${accent}40, ${accent}20, transparent)`,
                  }}
                />
              )}
              <button
                type="button"
                className={"ss-btn ss-" + effect + (on ? " on" : "") + (done ? " done" : "")}
                style={{ width: size, height: size, borderRadius: radius, ...paint(net.color) }}
                onClick={() => act(key)}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(key)}
                onBlur={() => setHovered(null)}
                aria-label={done ? "Link copied" : `Share on ${net.name}`}
              >
                {done ? (
                  <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d={ICONS.check} />
                  </svg>
                ) : (
                  <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={ICONS[key]} />
                  </svg>
                )}
                {tooltips && tooltips !== "false" && (
                  <span className="ss-tip" role="tooltip" aria-hidden={!on}>
                    {done ? "Copied" : net.name}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

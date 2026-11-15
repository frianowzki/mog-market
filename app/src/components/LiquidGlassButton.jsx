"use client";

/*
 * Liquid Glass Button — ported from the Framer "Liquid Glass Buttons" component
 * (liquid-glass-button.framer.website).
 *
 * The original is a three-layer stack: a blurred backdrop layer that samples the
 * page behind it (backdrop-filter + saturate), a specular rim made of two inset
 * shadows (bright top-left, dark bottom-right) plus an inner highlight line, and
 * a moving sheen that follows the pointer. On press the whole thing dips ~1px and
 * the rim tightens. Variants: clear | tinted | frost, sizes sm | md | lg.
 */

import { useRef, useState } from "react";

export default function LiquidGlassButton({
  children,
  href,
  onClick,
  variant = "clear",
  size = "md",
  icon,
  trailing,
  class: cls = "",
  disabled = false,
  ...rest
}) {
  const ref = useRef(null);
  const [sheen, setSheen] = useState({ x: 50, y: 0, on: false });

  const move = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSheen({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
      on: true,
    });
  };

  const Tag = href ? "a" : "button";

  return (
    <Tag
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={move}
      onMouseEnter={move}
      onMouseLeave={() => setSheen((s) => ({ ...s, on: false }))}
      disabled={Tag === "button" ? disabled : undefined}
      className={`lgb lgb-${variant} lgb-${size} ${cls}`}
      style={{ "--sx": `${sheen.x}%`, "--sy": `${sheen.y}%` }}
      data-sheen={sheen.on ? "on" : "off"}
      {...rest}
    >
      <span className="lgb-backdrop" aria-hidden="true" />
      <span className="lgb-tint" aria-hidden="true" />
      <span className="lgb-rim" aria-hidden="true" />
      <span className="lgb-sheen" aria-hidden="true" />
      <span className="lgb-rimlight" aria-hidden="true" />
      <span className="lgb-content">
        {icon ? <span className="lgb-ico">{icon}</span> : null}
        <span className="lgb-label">{children}</span>
        {trailing ? <span className="lgb-trail">{trailing}</span> : null}
      </span>
    </Tag>
  );
}

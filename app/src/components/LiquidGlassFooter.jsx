"use client";

/* Liquid glass footer — a port of the Framer "Liquid Glass Footer" component
   (liquid-glass-footer.framer.website).

   Reference structure, kept intact: one large frosted panel, a two-column
   top level — brand + blurb + subscribe form on the left, three link columns on
   the right — then a bottom hairline bar with copyright on the left and social
   discs on the right.

   The glass here is built the way the reference does it: a translucent fill, a
   backdrop blur with saturation, an inset rim highlight along the top edge, and
   a soft outer shadow. Nothing is a flat grey rectangle.

   Content is Motion Markets' own: real links to the board, the terminal, the
   faucet, and the two external references the app actually uses. */

import Link from "next/link";

function Social({ d, label, href }) {
  return (
    <a className="lgf-soc" href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d={d} /></svg>
    </a>
  );
}

const ICONS = {
  x: "M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.1L4.7 21H1.5l7.5-8.6L1.2 3h6.6l4.5 5.6L17.5 3Zm-1.1 16.1h1.8L7.7 4.8H5.8l10.6 14.3Z",
  tg: "M21.9 4.3 19 19.1c-.2 1-.8 1.2-1.6.8l-4.4-3.3-2.1 2c-.2.3-.4.4-.9.4l.3-4.5 8.2-7.4c.4-.3-.1-.5-.5-.2L7.9 12.3 3.6 11c-1-.3-1-1 .2-1.4l17-6.5c.8-.3 1.4.2 1.1 1.2Z",
  gh: "M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.7-1.4-2.2-.2-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.4 4.8-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z",
  scan: "M5 3h3v2H5v14h3v2H3V5a2 2 0 0 1 2-2Zm14 0a2 2 0 0 1 2 2v14h-2V5h-3V3h3ZM8 8h8v8H8V8Zm2 2v4h4v-4h-4Z",
};

export default function LiquidGlassFooter({
  columns = [],
  onSubscribe,
  className = "",
}) {
  return (
    <footer className={`lgf${className ? " " + className : ""}`}>
      {/* the glass sheet: separate element so the blur never inherits the
          page's own transforms */}
      <div className="lgf-sheet" aria-hidden="true" />

      <div className="lgf-inner">
        <div className="lgf-top">
          {/* ---------------------------------------------------------- brand */}
          <div className="lgf-brandcol">
            <span className="lgf-brand">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 17l5-6 4 4 5-8 4 5" />
              </svg>
              Motion <i>Markets</i>
            </span>
            <p className="lgf-blurb">
              Every creator on the Motion leaderboard is one share class, priced at
              1000 ÷ rank and settled onchain. Attention is the asset — the board is the order book.
            </p>

            <form
              className="lgf-sub"
              onSubmit={(e) => { e.preventDefault(); onSubscribe?.(e.currentTarget.email.value); }}
            >
              <input
                type="email"
                name="email"
                placeholder="your email"
                aria-label="email for board alerts"
                required
              />
              <button type="submit">
                notify me
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
              </button>
            </form>
            <span className="lgf-note">rank changes only · no spam</span>
          </div>

          {/* ------------------------------------------------------- link cols */}
          <nav className="lgf-cols" aria-label="Footer">
            {columns.map((col) => (
              <div className="lgf-col" key={col.label}>
                <span className="lgf-colhead">{col.label}</span>
                {col.items.map((it) => (
                  <Link key={it.label} href={it.href} className="lgf-link" target={it.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                    {it.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="lgf-bottom">
          <span className="lgf-copy">
            © {new Date().getFullYear()} Motion Markets · built on Fluent Testnet
          </span>
          <span className="lgf-socials">
            <Social d={ICONS.x} label="X" href="https://x.com/motion" />
            <Social d={ICONS.tg} label="Telegram" href="https://t.me/fluentxyz" />
            <Social d={ICONS.gh} label="GitHub" href="https://github.com/frianowzki/mog-market" />
            <Social d={ICONS.scan} label="Fluentscan" href="https://testnet.fluentscan.xyz" />
          </span>
        </div>
      </div>

      {/* the oversized wordmark the glass sits on — clipped by the sheet so it
          reads as something underneath, not as text */}
      <span className="lgf-mark" aria-hidden="true">MOTION</span>
    </footer>
  );
}

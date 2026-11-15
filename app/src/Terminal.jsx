"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, usePublicClient } from "wagmi";
import {
  useBoard, useBoardFeed, useFluent, usePrices, useTrader, useHoldings, useRankHistory, useTheme,
  makeMoney, ADDRESS, FAUCET, TOKEN, EXPLORER, fmt, priceOf, GAS_FAUCET_URL, PFP_URL,
  SYMBOL, deltaText, deltaDir, deltaOf,
} from "./mog.js";
import ExpandedCard from "./components/ExpandedCard.jsx";
import TearTicket from "./components/TearTicket.jsx";
import SocialShare from "./components/SocialShare.jsx";
import SidebarNav from "./components/SidebarNav.jsx";
import { CountUp, ScrambleText } from "./components/TextMotion.jsx";
import "./components/expanded-card.css";
import "./components/tear-ticket.css";
import "./components/social-share.css";
import "./components/sidebar-nav.css";
import "./terminal-framer.css";

/* ------------------------------------------------------------------ icons */

const Icon = ({ d, ...p }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d={d} />
  </svg>
);
const I = {
  feed: "M4 6h16M4 12h12M4 18h8",
  markets: "M3 17l5-6 4 4 5-8 4 5M3 21h18",
  portfolio: "M4 8h16v11H4zM8 8V5h8v3",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.6 1.6 0 008 19.4a1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H2a2 2 0 110-4h.1A1.6 1.6 0 004.6 8a1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V2a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H22a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z",
  drip: "M12 3s6 6.4 6 10.5A6 6 0 016 13.5C6 9.4 12 3 12 3z",
  logout: "M15 17l5-5-5-5M20 12H9M12 19H6a2 2 0 01-2-2V7a2 2 0 012-2h6",
  copy: "M9 9h9v9a2 2 0 01-2 2H9a2 2 0 01-2-2V9zM6 15H5a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1",
  check: "M20 6L9 17l-5-5",
  ext: "M14 4h6v6M20 4l-8 8M18 14v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4.2-4.2",
  up: "M12 19V5M6 11l6-6 6 6",
  down: "M12 5v14M6 13l6 6 6-6",
  flame: "M12 3s5 4.2 5 8a5 5 0 01-10 0c0-1.6.7-3 1.6-4.1-.2 1.6.5 2.6 1.4 3 0-2 .9-4.1 2-6.9z",
  sun: "M12 17a5 5 0 100-10 5 5 0 000 10zM12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  moon: "M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z",
  auto: "M4 5h13a3 3 0 013 3v8a3 3 0 01-3 3H4zM8 9v6M4 12H2",
  eye: "M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6zM12 15a3 3 0 100-6 3 3 0 000 6z",
  close: "M6 6l12 12M18 6L6 18",
  arrowUR: "M7 17L17 7M9 7h8v8",
  chevD: "M6 9l6 6 6-6",
};

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.2 22H3.1l7.3-8.3L1 2h6.5l4.4 5.9L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z" />
    </svg>
  );
}
function YouTubeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z" /></svg>;
}
function InstagramIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.8.1-1.1.1-1.5.2-1.8.3-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.3-.2.7-.3 1.8-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c.1 1.1.2 1.5.3 1.8.2.5.4.8.7 1.1.3.3.6.5 1.1.7.3.1.7.2 1.8.3 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1.1-.1 1.5-.2 1.8-.3.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.3.2-.7.3-1.8.1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c-.1-1.1-.2-1.5-.3-1.8-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.3-.1-.7-.2-1.8-.3-1.3-.1-1.7-.1-4.8-.1zm0 3.1a4.9 4.9 0 110 9.8 4.9 4.9 0 010-9.8zm0 8.1a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4zm6.2-8.3a1.1 1.1 0 11-2.3 0 1.1 1.1 0 012.3 0z" /></svg>;
}
function TikTokIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 2h-3v13.1a2.6 2.6 0 11-2.6-2.6c.3 0 .5 0 .8.1V9.5a5.8 5.8 0 105 5.7V8.6a6.6 6.6 0 003.6 1.1V6.6a3.6 3.6 0 01-3.8-3.5V2z" /></svg>;
}
function TwitchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2l-2 3v15h4v-2h3l3 3h4l4-4V2H4zm16 12l-2 2h-3l-3 3v-3H8V4h12v10zM13 7h2v5h-2V7zm-4 0h2v5H9V7z" /></svg>;
}
function KickIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h5v5h2V6h2V3h5v6h-2v2h-2v2h2v2h2v6h-5v-3h-2v-2H9v5H4V3z" /></svg>;
}

const hhmm = (secs) => {
  if (secs <= 0) return "ready";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
};
const clockOf = (ms) => {
  if (ms == null) return "—";
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/* Public handles we can stand behind, used when the feed carries no socials. */
const CURATED_SOCIALS = {
  ishowspeed: { x: "ishowspeed", youtube: "@IShowSpeed", instagram: "ishowspeed", tiktok: "@ishowspeed" },
  mrbeast: { x: "MrBeast", youtube: "@MrBeast", instagram: "mrbeast", tiktok: "@mrbeast" },
  elonmusk: { x: "elonmusk" },
  cristiano: { x: "Cristiano", instagram: "cristiano" },
  kaicenat: { x: "KaiCenat", youtube: "@KaiCenat", twitch: "kaicenat" },
  ludwig: { x: "LudwigAhgren", youtube: "@Ludwig", twitch: "ludwig" },
  "marquesbrownlee": { x: "MKBHD", youtube: "@mkbhd" },
  "patmcafee": { x: "PatMcAfeeShow", youtube: "@ThePatMcAfeeShow" },
  "lexfridman": { x: "lexfridman", youtube: "@lexfridman" },
};

const NETWORKS = [
  { k: "x", base: "https://x.com/", label: "X" },
  { k: "youtube", base: "https://youtube.com/", label: "YouTube" },
  { k: "instagram", base: "https://instagram.com/", label: "Instagram" },
  { k: "tiktok", base: "https://tiktok.com/", label: "TikTok" },
  { k: "twitch", base: "https://twitch.tv/", label: "Twitch" },
  { k: "kick", base: "https://kick.com/", label: "Kick" },
];

/* Official fluentscan mark, inlined so it inherits the theme colour instead of
   shipping a raster. Used on every contract row and the explorer card. */
const FluentScanMark = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6.6" stroke="currentColor" strokeWidth="2" />
    <path d="M15.4 15.4 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M7.2 11.6c1.6-1.3 3-1.3 4.6 0 1.6 1.3 3 1.3 4.6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/* Links for a creator, icons only. Verified feed socials win, curated handles
   next, and an X search (dimmed) as a last resort so the row is never empty. */
function socialLinks(name, metaSocials) {
  const key = (name || "").trim().toLowerCase();
  const curated = CURATED_SOCIALS[key] || {};
  const out = [];
  for (const n of NETWORKS) {
    const raw = curated[n.k] || (n.k === "x" ? metaSocials?.x?.handle?.replace(/^@/, "") : null);
    if (raw) {
      const clean = String(raw).replace(/^@/, "");
      out.push({ k: n.k, label: n.label, url: n.base + clean, found: true });
    }
  }
  if (!out.length) {
    out.push({
      k: "x", label: "X", found: false,
      url: `https://x.com/search?q=${encodeURIComponent(name || "")}&f=user`,
    });
  }
  return out;
}

const SocGlyph = ({ k }) =>
  k === "youtube" ? <YouTubeIcon /> : k === "instagram" ? <InstagramIcon />
    : k === "tiktok" ? <TikTokIcon /> : k === "twitch" ? <TwitchIcon />
      : k === "kick" ? <KickIcon /> : <XIcon />;

/* Sidebar order. Feed first: it is the dashboard you land on to read the board,
   markets is where you actually trade. */
const NAV = [
  { k: "feed", label: "Feed", icon: I.feed },
  { k: "markets", label: "Markets", icon: I.markets },
  { k: "portfolio", label: "Portfolio", icon: I.portfolio },
  { k: "settings", label: "Settings", icon: I.settings },
];

/* Desktop rail: same four destinations, but Markets/Portfolio/Settings each
   own a real submenu tree. The children switch the same `view` key plus a
   filter, so nothing in the app needs a second navigation concept. */
const NAV_TREE = [
  {
    k: "feed",
    label: "Feed",
    icon: <Icon d={I.feed} width="15" height="15" />,
  },
  {
    k: "markets",
    label: "Markets",
    icon: <Icon d={I.markets} width="15" height="15" />,
    hint: "rank-priced",
    children: [
      {
        label: "discover",
        items: [
          { k: "markets", label: "All creators", note: "board" },
          { k: "markets:top", label: "Top 20", note: "rank" },
          { k: "markets:movers", label: "Movers", note: "24h" },
        ],
      },
      {
        label: "watch",
        items: [
          { k: "markets:watch", label: "Watchlist" },
          { k: "markets:new", label: "New listings" },
        ],
      },
    ],
  },
  {
    k: "portfolio",
    label: "Portfolio",
    icon: <Icon d={I.portfolio} width="15" height="15" />,
    hint: "your book",
    children: [
      {
        label: "holdings",
        items: [
          { k: "portfolio", label: "Positions", note: "open" },
          { k: "portfolio:closed", label: "Closed" },
        ],
      },
      {
        label: "activity",
        items: [
          { k: "portfolio:orders", label: "Orders" },
          { k: "portfolio:history", label: "History" },
        ],
      },
    ],
  },
  {
    k: "settings",
    label: "Settings",
    icon: <Icon d={I.settings} width="15" height="15" />,
    hint: "wallet & display",
    children: [
      {
        label: "account",
        items: [
          { k: "settings", label: "Wallet" },
          { k: "settings:faucet", label: "Faucet", note: "12h" },
        ],
      },
      {
        label: "display",
        items: [
          { k: "settings:theme", label: "Theme" },
          { k: "settings:about", label: "About" },
        ],
      },
    ],
  },
];

/* submenu keys carry a ":filter" suffix — collapse them onto the base view so
   the existing view switch keeps working unchanged */
const baseView = (k) => String(k || "").split(":")[0] || "feed";

/* ------------------------------------------------------------------ widgets */

function BrandMark() {
  return (
    <div className="brand">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17l5-6 4 4 5-8 4 5" />
        </svg>
      </span>
      <span className="brand-name">Motion <i>Markets</i></span>
    </div>
  );
}

function NameAvatar({ name, uuid, size = 26 }) {
  const [failed, setFailed] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const initials = (name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  let h = 0;
  for (const ch of name || "") h = (h * 31 + ch.charCodeAt(0)) % 360;
  const src = useFallback
    ? `/api/avatar?name=${encodeURIComponent(name || "")}`
    : uuid ? PFP_URL(uuid) : null;
  const showImg = src && !failed;
  return (
    <span
      className={"av" + (showImg ? " av-img" : "")}
      style={{
        width: size, height: size, flex: "none", borderRadius: "var(--av-r)",
        display: "grid", placeItems: "center", overflow: "hidden",
        background: showImg ? "var(--paper2)" : `hsl(${h} 76% 58%)`,
        color: "hsl(" + h + " 62% 12%)",
        fontFamily: "Archivo,sans-serif", fontSize: Math.round(size * 0.38), fontWeight: 700,
        letterSpacing: "-0.02em",
      }}
    >
      {showImg ? (
        <img
          src={src} alt={name} loading="lazy" decoding="async" referrerPolicy="no-referrer"
          onError={() => {
            if (!useFallback) setUseFallback(true);
            else setFailed(true);
          }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        initials
      )}
    </span>
  );
}

/* Desktop hover card: avatar scales up, details card drops beside it with rank,
   price and the creator's socials as official glyphs (no "find on X" copy).
   Hover is discovery only — no buy button; clicking the row opens the ticket. */
function CreatorCell({ row, price, fiat, held, socials }) {
  const [hot, setHot] = useState(false);
  const links = socialLinks(row.name, socials);
  return (
    <div
      className={"who hoverable" + (hot ? " hot" : "")}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
    >
      <NameAvatar name={row.name} uuid={socials?.uuid} size={26} />
      <span className="nm">{row.name}</span>
      {held && <span className="tag">held</span>}

      <div className="hcard" role="tooltip">
        <div className="hcard-top">
          <div className="hcard-pfp">
            <NameAvatar name={row.name} uuid={socials?.uuid} size={96} />
          </div>
          <div className="hcard-id">
            <span className="hcard-rank num">rank #{row.position}</span>
            <h4>{row.name}</h4>
            <div className="hcard-px num">
              {fmt(price)} {SYMBOL}
              <span>{fiat}</span>
            </div>
          </div>
        </div>
        <div className="hcard-links">
          {links.map((l) => (
            <a
              key={l.k} className={l.k + (l.found ? "" : " notfound")} href={l.url}
              target="_blank" rel="noopener noreferrer nofollow" title={l.label}
              aria-label={l.label} onClick={(e) => e.stopPropagation()}
            >
              <SocGlyph k={l.k} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeltaTag({ d, withGlyph = true }) {
  const dir = deltaDir(d);
  return (
    <span className={"chg " + dir}>
      <span className="mini">
        {withGlyph && dir === "u" && <Icon d={I.up} />}
        {withGlyph && dir === "d" && <Icon d={I.down} />}
        {deltaText(d)}
      </span>
    </span>
  );
}

export async function copyText(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch { return false; }
}

function ThemeSwitch({ mode, pick, compact }) {
  const opts = [
    { k: "light", label: "Light", icon: I.sun },
    { k: "dark", label: "Dark", icon: I.moon },
    { k: "auto", label: "Auto", icon: I.auto },
  ];
  return (
    <div className="theme-sw" role="radiogroup" aria-label="Theme">
      {opts.map((o) => (
        <button
          key={o.k} role="radio" aria-checked={mode === o.k}
          className={mode === o.k ? "on" : ""} onClick={() => pick(o.k)}
          title={o.label} aria-label={o.label}
        >
          <Icon d={o.icon} />
          {!compact && <span>{o.label}</span>}
        </button>
      ))}
    </div>
  );
}

function AddressModal({ address, onClose, onCopied }) {
  const [done, setDone] = useState(false);
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-h">
          <span>your fluent testnet address</span>
          <button className="modal-x" onClick={onClose} aria-label="close">×</button>
        </div>
        <p className="modal-p">
          Long-press or select the address, then paste it into the{" "}
          <a href={GAS_FAUCET_URL} target="_blank" rel="noopener noreferrer">Fluent faucet</a>.
        </p>
        <code className="modal-code" onClick={async () => {
          const ok = await copyText(address);
          if (ok) { setDone(true); onCopied?.(); }
        }}>{address}</code>
        <div className="modal-f">
          <button className="btn ghost" onClick={async () => {
            const ok = await copyText(address);
            setDone(ok);
            if (ok) onCopied?.();
          }}>{done ? "copied ✓" : "copy address"}</button>
          <a className="btn primary" href={GAS_FAUCET_URL} target="_blank" rel="noopener noreferrer">
            open faucet ↗
          </a>
        </div>
      </div>
    </div>
  );
}

/* Official contract panel: every row carries the Fluent mark and links out to
   that contract on fluentscan. */
/* Contract rows: a real fluentscan card, not a bare address. The logo is the
   official mark, the whole row opens the address on the explorer, and the copy
   button sits beside the link so you can grab the address without leaving. */
function ContractRow({ label, addr, note }) {
  const [copied, setCopied] = useState(false);
  const copy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (await copyText(addr)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };
  const inner = (
    <>
      <span className="mark">
        <FluentScanMark size={17} />
      </span>
      <span className="ctxt">
        <i>{label}</i>
        <b className="num">{addr ? `${addr.slice(0, 10)}…${addr.slice(-8)}` : "not configured"}</b>
        <span>{note}</span>
      </span>
      {addr && (
        <span className="cacts">
          <button className="ccopy" onClick={copy} title={copied ? "copied" : "copy address"} aria-label="copy address">
            {copied ? <Icon d={I.check} width="12" height="12" /> : <Icon d={I.copy} width="12" height="12" />}
          </button>
          <span className="cext"><Icon d={I.ext} width="12" height="12" /></span>
        </span>
      )}
    </>
  );
  return addr
    ? <a className="crow" href={`${EXPLORER}/address/${addr}`} target="_blank" rel="noopener noreferrer" title={`Open ${addr} on fluentscan`}>{inner}</a>
    : <div className="crow">{inner}</div>;
}

/* ------------------------------------------------------------------ terminal */

export function Terminal() {
  const privy = usePrivy();
  /* DEV_SHOT: screenshot-only bypass, active only with ?shot=1 in the URL. */
  const devShot = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("shot") === "1";
  const ready = privy.ready || devShot;
  const authenticated = privy.authenticated || devShot;
  const { login, logout } = privy;
  const { address: realAddress } = useAccount();
  const address = realAddress || (devShot ? "0x7007249a5f8de53a2917256778432f3d5db5f097" : undefined);
  const pub = usePublicClient();
  const theme = useTheme();
  const feed = useBoardFeed(3000);
  const { rows, loading, error, reload, syncedAt } = useBoard(feed, 15000);
  const fluent = useFluent(address);
  const prices = usePrices();
  const trader = useTrader(address, reload);
  const { map: holdingMap, entryKnown } = useHoldings(address, rows, pub);
  const rankHistory = useRankHistory(30_000);

  const metaOf = useCallback((nm) => feed.meta[(nm || "").trim().toLowerCase()] || null, [feed.meta]);

  const [view, setView] = useState("feed");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [showAddr, setShowAddr] = useState(false);
  const [toast, setToast] = useState(null);
  const [units, setUnits] = useState(1);
  const [currency, setCurrency] = useState("USD");
  const [showDrip, setShowDrip] = useState(false);
  const [sheet, setSheet] = useState(false);   // mobile trade sheet
  const [posOpen, setPosOpen] = useState(null); // position popup (portfolio)
  const [feedTab, setFeedTab] = useState("movers"); // movers | ranks
  const [mounted, setMounted] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const c = localStorage.getItem("mm.currency");
      if (c) setCurrency(c);
    } catch { /* private mode */ }
    const mq = window.matchMedia("(max-width: 1000px)");
    setIsNarrow(mq.matches);
    const onChange = (e) => setIsNarrow(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const pickCurrency = (c) => {
    setCurrency(c);
    try { localStorage.setItem("mm.currency", c); } catch { /* ignore */ }
  };

  const flash = useCallback((msg, isErr) => {
    setToast({ msg, isErr });
    setTimeout(() => setToast(null), 4600);
  }, []);

  const money = useMemo(() => makeMoney(prices.rates, currency), [prices.rates, currency]);
  const usdOf = useCallback((wei) => (Number(wei) / 1e18) * Number(prices.bySymbol[SYMBOL] || 0), [prices.bySymbol]);
  const fiatOf = useCallback((wei) => money(usdOf(wei)), [money, usdOf]);
  const fiatEth = useCallback(
    (wei) => money((Number(wei) / 1e18) * Number(prices.bySymbol.ETH || 0)),
    [money, prices.bySymbol.ETH]
  );

  const needle = q.trim().toLowerCase();
  const filtered = useMemo(
    () => (needle ? rows.filter((r) => r.name.toLowerCase().includes(needle)) : rows),
    [rows, needle]
  );

  const sel = selected ? rows.find((r) => r.id === selected) : null;
  const selPrice = sel ? priceOf(sel.position) : 0n;
  const heldSel = sel ? holdingMap[sel.id]?.units ?? 0n : 0n;
  const qty = Math.max(1, Number(units) || 1);
  const cost = selPrice * BigInt(qty);
  const busy = trader.busy || fluent.busy;
  const dripAmount = fluent.drip || 5000n * 10n ** 18n;

  const wrapped = useCallback(async (fn, label) => {
    try {
      await fn();
      flash(label + " · confirmed", false);
    } catch (e) {
      flash((e.shortMessage || e.message || "failed").slice(0, 130), true);
    }
  }, [flash]);

  const onClaim = () => wrapped(async () => {
    try {
      await fluent.claim();
    } catch (e) {
      const msg = String(e?.shortMessage || e?.message || "");
      if (/funds|balance|gas|insufficient/i.test(msg)) {
        flash("no testnet ETH for gas — opening the Fluent faucet…", true);
        window.open(GAS_FAUCET_URL, "_blank", "noopener");
        throw e;
      }
      throw e;
    }
  }, `requested ${fmt(dripAmount, 0)} ${SYMBOL}`);

  const onRefill = () => wrapped(() => fluent.refill(), `requested ${fmt(dripAmount, 0)} ${SYMBOL}`);

  const onBuy = () => {
    if (!sel) return;
    wrapped(async () => {
      if (fluent.balance < cost) throw new Error(`not enough ${SYMBOL} for ${qty} unit${qty === 1 ? "" : "s"}`);
      await trader.buy(sel.id, BigInt(qty), cost);
      await fluent.refetch();
      await reload();
    }, `bought ${qty} × ${sel.name}`);
  };

  const onSell = (all = false) => {
    if (!sel) return;
    const want = all ? heldSel : BigInt(Math.min(qty, Number(heldSel)));
    wrapped(async () => {
      if (heldSel === 0n) throw new Error("no units to sell");
      await trader.sell(sel.id, want);
      await fluent.refetch();
      await reload();
    }, `sold ${want.toString()} × ${sel.name}`);
  };

  /* One click on a creator: desktop opens the side ticket, narrow opens the
     bottom sheet. Never navigates away — that's what the portfolio popup is for. */
  const openCreator = useCallback((id) => {
    setSelected(id);
    setUnits(1);
    if (isNarrow) setSheet(true);
  }, [isNarrow]);

  if (!ready) {
    return (
      <>
        <TopBar theme={theme} />
        <div className="center-msg">initialising…</div>
      </>
    );
  }

  const holdings = Object.values(holdingMap);
  const bookValue = holdings.reduce((a, h) => a + h.value, 0n);
  const netWorth = fluent.balance + bookValue;

  const liveAge = feed.syncedAt ? Date.now() - feed.syncedAt : null;
  const liveFresh = liveAge != null && liveAge < 45_000;

  const hero = (
    <section className="hero-block">
      <div className="hero-copy">
        <span className="kicker">motion leaderboard · fluent testnet</span>
        <h1>
          Attention is the asset.<br />Rank is the <i>price</i>.
        </h1>
        <p className="lede">
          Every creator on the Motion board is one share class and one number:
          <b> 1000 ÷ rank</b>. No order book, no pool, no slippage curve. They climb,
          your position is worth more; they slide, it isn’t. The board rebalances every
          few hours — and the market never closes on you.
        </p>
        <div className="hero-facts">
          <div><i>settled in</i><b>{SYMBOL}</b></div>
          <div><i>drip from here</i><b>{fmt(dripAmount, 0)} / 12 h</b></div>
          <div><i>price model</i><b>1000 ÷ rank</b></div>
          <div><i>gas</i><b>testnet ETH</b></div>
        </div>
      </div>
      <div className="hero-side">
        <div className="tick num">
          <span>{SYMBOL} / {currency}</span>
          <b>{money(prices.bySymbol[SYMBOL])}</b>
          <em>{prices.source}</em>
        </div>
        <div className="tick num">
          <span>ETH / {currency}</span>
          <b>{money(prices.bySymbol.ETH)}</b>
          <em>coingecko</em>
        </div>
        <div className="tick num">
          <span>creators live</span>
          <b>{rows.length || "—"}</b>
          <em>synced {clockOf(syncedAt)}</em>
        </div>
      </div>
    </section>
  );

  const transfer = (
    <TradePanel
      sel={sel}
      selPrice={selPrice}
      heldSel={heldSel}
      qty={qty}
      units={units}
      setUnits={setUnits}
      cost={cost}
      fiatOf={fiatOf}
      money={money}
      fluent={fluent}
      trader={trader}
      busy={busy}
      dripAmount={dripAmount}
      onClaim={onClaim}
      onBuy={onBuy}
      onSell={onSell}
      onRefill={onRefill}
      metaOf={metaOf}
      currency={currency}
      SYMBOL={SYMBOL}
      onClose={() => setSheet(false)}
      sheet={sheet}
    />
  );

  return (
    <>
      <TopBar
        theme={theme}
        authed={authenticated}
        syncedAt={syncedAt}
      />

      {!ADDRESS && (
        <div className="banner">
          No contract address configured — set NEXT_PUBLIC_CONTRACT_ADDRESS and rebuild.
        </div>
      )}
      {error && <div className="banner">Board read failed: {error}</div>}

      {!authenticated ? (
        <>
          {hero}
          <div className="login-wrap">
            <h2>Sign in to trade</h2>
            <p>{rows.length} creators are on the board. Log in with X to get a wallet and your {SYMBOL}.</p>
            <button className="x-btn" onClick={login}>
              <XIcon /> Continue with X
            </button>
            {ADDRESS && (
              <p className="num" style={{ fontSize: 10, color: "var(--mute)" }}>
                market {ADDRESS.slice(0, 10)}…{ADDRESS.slice(-6)} ·{" "}
                <a href={`${EXPLORER}/address/${ADDRESS}`} target="_blank" rel="noreferrer">fluentscan</a>
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="frame">
          <nav className={"rail" + (isNarrow ? "" : " rail-nav")} aria-label="sections">
            <BrandMark />
            {isNarrow ? (
              <div className="rail-group">
                {NAV.map((n) => (
                  <button
                    key={n.k}
                    className={"rail-i" + (view === n.k ? " on" : "")}
                    onClick={() => { setView(n.k); setSheet(false); }}
                    title={n.label}
                  >
                    <Icon d={n.icon} width="17" height="17" />
                    <span>{n.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rail-navwrap">
                <SidebarNav
                  active={view}
                  onChange={(k) => { setView(k); setSheet(false); }}
                  groups={NAV_TREE}
                  footer={null}
                />
              </div>
            )}

            <div className="rail-net">
              <span className="rail-lbl">net worth</span>
              <b className="num"><CountUp to={netWorth} decimals={netWorth < 100 ? 2 : 0} duration={1200} /></b>
              <em className="num">
                <ScrambleText text={fiatOf(netWorth)} duration={700} />
              </em>
              <div className="rail-split num">
                <span>liquid {fmt(fluent.balance)}</span>
                <span>book {fmt(bookValue)}</span>
              </div>
            </div>

            {/* anything transactional lives down here, out of the top bar:
                faucet, wallet, disconnect. The bar keeps brand + status + the
                theme switch, so it reads as a plain navbar. */}
            <div className="rail-utils">
              <button
                className={"rail-faucet" + (fluent.canClaim && fluent.cooldownRemaining === 0 ? " ready" : "")}
                onClick={() => setShowDrip(true)}
                title={`Request testnet ${SYMBOL}`}
              >
                <Icon d={I.drip} width="13" height="13" />
                <span>faucet</span>
                <b className="num">{fmt(fluent.balance)}</b>
              </button>
              <div className="rail-foot">
                <button className="rail-addr" onClick={() => setShowAddr(true)} title={address || ""}>
                  <Icon d={I.copy} width="12" height="12" />
                  <span className="num">{address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "not connected"}</span>
                </button>
                <button className="rail-out" onClick={logout} title="Disconnect" aria-label="Disconnect">
                  <Icon d={I.logout} width="14" height="14" />
                </button>
              </div>
            </div>
          </nav>

          <main className="main">
            {baseView(view) === "markets" && (
              <>
                {hero}

                <div className="board-h">
                  <span className="t">
                    price board · {filtered.length}/{rows.length}
                    <span className={"top-live"} style={{ marginLeft: 10 }}>
                      <i className={"dot" + (liveFresh ? "" : " stale")} />
                      {liveFresh ? "live" : "sync"}
                      {feed.capturedAt && ` ${clockOf(new Date(feed.capturedAt).getTime())}`}
                    </span>
                  </span>
                  <label className="search">
                    <Icon d={I.search} width="13" height="13" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="search creator"
                      autoComplete="off"
                      spellCheck="false"
                      aria-label="search creator"
                    />
                    {q && (
                      <button onClick={() => setQ("")} aria-label="clear"><Icon d={I.close} width="11" height="11" /></button>
                    )}
                  </label>
                </div>

                {loading ? (
                  <div className="center-msg">reading board from fluent…</div>
                ) : rows.length === 0 ? (
                  <div className="center-msg">board is empty — no creators synced onchain yet</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Creator</th>
                        <th>Price ({SYMBOL})</th>
                        <th className="th-spark">Trend</th>
                        <th>{currency}</th>
                        <th className="th-delta">Rank Δ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r) => {
                        const held = holdingMap[r.id];
                        const p = priceOf(r.position);
                        return (
                          <tr
                            key={r.id}
                            className={"asset" + (held ? " held" : "")}
                            onClick={() => openCreator(r.id)}
                          >
                            <td className="rank num">{r.position}</td>
                            <td>
                              <CreatorCell
                                row={r}
                                price={p}
                                fiat={fiatOf(p)}
                                held={Boolean(held)}
                                socials={metaOf(r.name)}
                              />
                            </td>
                            <td className="price num">{fmt(p)}<span className="ut">{SYMBOL}</span></td>
                            <td className="spark-cell">
                              <SwarmSpark points={rankHistory?.series?.[(r.name || "").trim().toLowerCase()]?.points} />
                            </td>
                            <td className="num" style={{ color: "var(--mute)", fontSize: 11 }}>{fiatOf(p)}</td>
                            <td className="chg-cell"><DeltaTag d={r.delta} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </>
            )}

            {baseView(view) === "feed" && (
              <FeedView
                rows={rows}
                holdingMap={holdingMap}
                fiatOf={fiatOf}
                metaOf={metaOf}
                feedTab={feedTab}
                setFeedTab={setFeedTab}
                onOpen={openCreator}
                capturedAt={feed.capturedAt}
                liveFresh={liveFresh}
                syncedAt={syncedAt}
                total={rows.length}
              />
            )}

            {baseView(view) === "portfolio" && (
              <PortfolioView
                holdings={holdings}
                entryKnown={entryKnown}
                netWorth={netWorth}
                bookValue={bookValue}
                balance={fluent.balance}
                ethBalance={fluent.ethBalance}
                ethSymbol={fluent.ethSymbol}
                fiatOf={fiatOf}
                fiatEth={fiatEth}
                money={money}
                metaOf={metaOf}
                rows={rows}
                rankHistory={rankHistory}
                onPosition={(id) => { setSelected(id); setUnits(1); setPosOpen(id); }}
                goMarkets={() => setView("markets")}
                currency={currency}
                usdOf={usdOf}
              />
            )}

            {baseView(view) === "settings" && (
              <section className="pane">
                <div className="pane-h"><h2>Settings</h2><span className="num">saved in this browser</span></div>

                <div className="set-row">
                  <div>
                    <b>Appearance</b>
                    <p>Light, dark, or follow the system. Applies everywhere instantly.</p>
                  </div>
                  <div style={{ minWidth: 210 }}>
                    <ThemeSwitch mode={theme.mode} pick={theme.pick} />
                  </div>
                </div>

                <div className="set-row">
                  <div>
                    <b>Display currency</b>
                    <p>Every fiat figure converts at the live rate.</p>
                  </div>
                  <select value={currency} onChange={(e) => pickCurrency(e.target.value)}>
                    {["USD", "IDR", "EUR", "GBP", "SGD", "JPY", "INR", "MYR", "AUD", "CNY"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="set-row">
                  <div>
                    <b>Wallet</b>
                    <p className="num">{address || "not connected"}</p>
                  </div>
                  <div className="set-acts">
                    <button className="btn ghost" onClick={() => setShowAddr(true)}>address</button>
                    <button className="btn ghost" onClick={() => setShowDrip(true)}>
                      <Icon d={I.drip} width="14" height="14" /> faucet
                    </button>
                    <button className="btn ghost" onClick={logout}>
                      <Icon d={I.logout} width="14" height="14" /> disconnect
                    </button>
                  </div>
                </div>

                <div className="set-row" style={{ display: "block" }}>
                  <div style={{ marginBottom: 12 }}>
                    <b>Contracts</b>
                    <p>Every address opens on fluentscan — verify the bytes you're trading.</p>
                  </div>

                  <a className="scan-hero" href={`${EXPLORER}/address/${ADDRESS}`} target="_blank" rel="noopener noreferrer">
                    <span className="sh-mark"><FluentScanMark size={22} /></span>
                    <span className="sh-txt">
                      <i>official explorer</i>
                      <b>fluentscan</b>
                      <em className="num">{EXPLORER.replace(/^https?:\/\//, "")}</em>
                    </span>
                    <span className="sh-go">
                      open
                      <Icon d={I.ext} width="13" height="13" />
                    </span>
                  </a>

                  <div className="contracts">
                    <ContractRow label="market" addr={ADDRESS} note="price board · buy / sell" />
                    <ContractRow label={SYMBOL} addr={TOKEN} note="ERC-20 quote asset" />
                    <ContractRow label="faucet" addr={FAUCET} note={`${fmt(dripAmount, 0)} ${SYMBOL} / 12 h`} />
                  </div>
                  <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <a className="scan-badge" href={GAS_FAUCET_URL} target="_blank" rel="noopener noreferrer">
                      <Icon d={I.drip} width="11" height="11" />
                      eth gas faucet
                      <Icon d={I.ext} width="11" height="11" />
                    </a>
                  </div>
                </div>

                <div className="set-row">
                  <div>
                    <b>Rates</b>
                    <p>{SYMBOL} {money(prices.bySymbol[SYMBOL])} · ETH {money(prices.bySymbol.ETH)}</p>
                    <p className="num" style={{ fontSize: 11, color: "var(--mute)" }}>source: {prices.source}</p>
                  </div>
                </div>
              </section>
            )}
          </main>

          {baseView(view) === "markets" && !isNarrow && (
            <aside className="dealer">
              <div className="dealer-h">
                <span className="t">{sel ? "trade ticket" : "select a creator"}</span>
              </div>
              {transfer}
            </aside>
          )}
        </div>
      )}

      {authenticated && (
        <footer className="foot">
          <div className="foot-l">
            <BrandMark />
            <p>Paper reputational markets on the Motion leaderboard. Testnet only — no real funds.</p>
          </div>
          <div className="foot-r">
            <a href={`${EXPLORER}/address/${ADDRESS}`} target="_blank" rel="noreferrer">fluentscan ↗</a>
            <a href={GAS_FAUCET_URL} target="_blank" rel="noopener noreferrer">gas faucet ↗</a>
            <a href="https://leaderboard.motion.game" target="_blank" rel="noopener noreferrer">motion leaderboard ↗</a>
          </div>
        </footer>
      )}

      {/* mobile trade sheet */}
      {sheet && sel && authenticated && (
        <div className="sheet-scrim" onClick={() => setSheet(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-grip" onClick={() => setSheet(false)} />
            {transfer}
          </div>
        </div>
      )}

      {/* portfolio position popup — tapping a holding never leaves the tab */}
      {posOpen && authenticated && (() => {
        const h = holdingMap[posOpen];
        if (!h) return null;
        const row = rows.find((r) => r.id === posOpen);
        return (
          <PositionModal
            h={h}
            row={row}
            metaOf={metaOf}
            fiatOf={fiatOf}
            rankHistory={rankHistory}
            onClose={() => setPosOpen(null)}
            onTrade={() => { setPosOpen(null); }}
            selPrice={sel && sel.id === posOpen ? selPrice : h.price}
            qty={qty}
            units={units}
            setUnits={setUnits}
            cost={sel && sel.id === posOpen ? cost : h.price * BigInt(qty)}
            fluent={fluent}
            trader={trader}
            busy={busy}
            onBuy={onBuy}
            onSell={onSell}
            onClaim={onClaim}
            onRefill={onRefill}
            dripAmount={dripAmount}
            sheet={isNarrow}
          />
        );
      })()}

      {toast && <div className={"toast on" + (toast.isErr ? " err" : "")}>{toast.msg}</div>}
      {showAddr && address && (
        <AddressModal
          address={address}
          onClose={() => setShowAddr(false)}
          onCopied={() => flash("address copied — paste it into the Fluent faucet", false)}
        />
      )}
      {showDrip && (
        <DripModal
          fluent={fluent}
          dripAmount={dripAmount}
          money={money}
          usdOf={usdOf}
          onClose={() => setShowDrip(false)}
          onClaim={onClaim}
          onRefill={onRefill}
        />
      )}
    </>
  );
}

/* Top bar: the navbar proper. Brand left, and on the right only what is not
   transactional — the live-status dot and the theme switch (icon-only). Faucet,
   wallet and disconnect moved down into the rail's utility block, so the bar
   stays one thin clean strip. */
function TopBar({ theme, authed, syncedAt }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const age = syncedAt ? Math.max(0, Math.floor((Date.now() - syncedAt) / 1000)) : null;
  const fresh = age != null && age < 12;
  return (
    <div className="top">
      <span className="top-l"><BrandMark /></span>
      <span className="top-r">
        {authed && (
          <span className={"top-live" + (fresh ? "" : " stale")} title={age == null ? "waiting for first read" : `board read ${age}s ago`}>
            <i className={"dot" + (fresh ? "" : " stale")} />
            {age == null ? "sync" : fresh ? `live · ${age}s` : `${age}s`}
          </span>
        )}
        {theme && (
          <span className="theme-mini">
            <ThemeSwitch mode={theme.mode} pick={theme.pick} compact />
          </span>
        )}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------- trade panel */

function TradePanel({
  sel, selPrice, heldSel, qty, units, setUnits, cost, fiatOf, money, fluent, trader,
  busy, dripAmount, onClaim, onBuy, onSell, onRefill, metaOf, currency, SYMBOL, onClose, sheet,
}) {
  if (!sel) {
    return <div className="empty">click any row on the board to open its trade ticket</div>;
  }
  const links = socialLinks(sel.name, metaOf(sel.name));
  const maxAfford = selPrice > 0n ? Number(fluent.balance / selPrice) : 0;
  const costFiat = fiatOf(cost);
  const rankUp = sel.position > 1 ? sel.position - 1 : 1;
  const rankDown = sel.position + 1;

  return (
    <>
      <div className="tk-top">
        <NameAvatar name={sel.name} uuid={metaOf(sel.name)?.uuid} size={44} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="tk-nm">{sel.name}</div>
          <div className="tk-rank num">rank #{sel.position} · {fmt(selPrice)} <u>{SYMBOL}</u></div>
          <div className="tk-fiat num">{fiatOf(selPrice)} per unit</div>
        </div>
        {sheet && (
          <button className="modal-x" onClick={onClose} aria-label="close">×</button>
        )}
      </div>

      <div className="tk-links">
        {links.map((l) => (
          <a key={l.k} className={l.k + (l.found ? "" : " notfound")} href={l.url}
             target="_blank" rel="noopener noreferrer nofollow" title={l.label} aria-label={l.label}>
            <SocGlyph k={l.k} />
          </a>
        ))}
      </div>

      <div className="qty-row">
        <span>how many units</span>
        <div className="stepper">
          <button onClick={() => setUnits((u) => Math.max(1, (Number(u) || 1) - 1))} aria-label="minus">−</button>
          <input
            type="number" min="1" step="1" value={units} inputMode="numeric"
            onChange={(e) => setUnits(e.target.value === "" ? "" : Math.max(1, Math.floor(Number(e.target.value))))}
          />
          <button onClick={() => setUnits((u) => (Number(u) || 1) + 1)} aria-label="plus">+</button>
        </div>
      </div>
      <div className="qty-presets">
        {[1, 5, 10, 25].map((n) => (
          <button key={n} className={qty === n ? "on" : ""} onClick={() => setUnits(n)}>{n}</button>
        ))}
        <button className="max" onClick={() => setUnits(Math.max(1, maxAfford))} title="max affordable">max</button>
      </div>

      {/* every number spelled out, in plain words — a unit is a share of one
          creator; its price is fixed by rank, so the sum is fully checkable */}
      <div className="tk-sum">
        <div>
          <span>price · 1 unit</span>
          <b className="num">{fmt(selPrice)} {SYMBOL}</b>
        </div>
        <div>
          <span>1 unit in {currency}</span>
          <em className="num">{fiatOf(selPrice)}</em>
        </div>
        <div>
          <span>units you're trading</span>
          <b className="num">{qty} {qty === 1 ? "unit" : "units"}</b>
        </div>
        <div>
          <span>you already hold</span>
          <b className="num">{heldSel.toString()} {Number(heldSel) === 1 ? "unit" : "units"}</b>
        </div>
        <div>
          <span>your balance</span>
          <b className="num">{fmt(fluent.balance)} {SYMBOL}</b>
        </div>
        <div>
          <span>most you can buy</span>
          <b className="num">{maxAfford} {maxAfford === 1 ? "unit" : "units"}</b>
        </div>
        <div className="tot">
          <span>order total</span>
          <b className="num">{fmt(cost)} {SYMBOL}</b>
        </div>
        <div>
          <span>order total in {currency}</span>
          <em className="num">{costFiat}</em>
        </div>
      </div>
      <p className="tk-hint">
        <b>1 unit = one share of {sel.name}.</b> Price is 1000 ÷ rank, so at rank
        #{sel.position} one unit costs <u>{fmt(selPrice)} {SYMBOL}</u>.{" "}
        {sel.position > 1
          ? `One place up (#${rankUp}) makes it worth ${fmt(priceOf(rankUp))} ${SYMBOL}; one down (#${rankDown}), ${fmt(priceOf(rankDown))} ${SYMBOL}.`
          : `Already at the top: holding #1 is the best case, slipping to #${rankDown} would make it worth ${fmt(priceOf(rankDown))} ${SYMBOL}.`}{" "}
        {SYMBOL} is the market's quote token — your balance above is paid in it.
      </p>

      {!fluent.claimed ? (
        <button className="btn primary" disabled={busy || !fluent.canClaim} onClick={onClaim}>
          {fluent.busy ? "confirming…" : `claim ${fmt(dripAmount, 0)} ${SYMBOL}`}
        </button>
      ) : (
        <div className="tk-acts">
          <button className="btn buy-b" disabled={busy || fluent.balance < cost} onClick={onBuy}>
            {trader.busy ? "confirming…" : `buy ${qty}`}
          </button>
          <button className="btn sell-b" disabled={busy || heldSel === 0n} onClick={() => onSell(false)}>
            {heldSel === 0n ? "sell" : `sell ${Math.min(qty, Number(heldSel))}`}
          </button>
        </div>
      )}
      {heldSel > 0n && (
        <button className="linkbtn" onClick={() => onSell(true)}>
          close full position ({heldSel.toString()} units)
        </button>
      )}
      {fluent.claimed && fluent.balance < cost && (
        <div className="warn">
          not enough {SYMBOL} — <button className="linkbtn" onClick={onRefill}>request a drip</button>
        </div>
      )}
      {trader.txError && <div className="warn err">{trader.txError}</div>}
    </>
  );
}


/* ---------------------------------------------------------------- feed view */
/* A trading desk, not a list. The feed answers four questions at a glance:
   is the board heating up (pulse), who is winning (gainers), who is bleeding
   (losers), and what changed most (biggest moves + the 10-20 hot band). Every
   number is the live rank delta from the Motion snapshot — a creator whose rank
   did not move renders an em dash, never "flat" and never "0". */

function MoverRow({ r, holdingMap, fiatOf, metaOf, onOpen, extra }) {
  const p = priceOf(r.position);
  const d = deltaOf(r);
  const wasRank = d !== 0 ? r.position - d : null;
  const subNote = extra ?? (wasRank ? `was #${wasRank}` : d === 0 ? "unchanged" : "priced in");
  return (
    <div className={"mover" + (d > 0 ? " up" : d < 0 ? " down" : "")} onClick={() => onOpen(r.id)}>
      <span className="ix num">{r.position}</span>
      <NameAvatar name={r.name} uuid={metaOf(r.name)?.uuid} size={24} />
      <span style={{ minWidth: 0 }}>
        <div className="nm">{r.name}</div>
        <div className="sub num">
          {fmt(p)} {SYMBOL} · {fiatOf(p)}{holdingMap[r.id] ? " · held" : ""}
        </div>
      </span>
      <span className="right">
        <div className={"d num " + deltaDir(d)}>{deltaText(d)}</div>
        <div className="px num">{subNote}</div>
      </span>
    </div>
  );
}

function MoverBoard({ rows, holdingMap, fiatOf, metaOf, onOpen, title, kind, icon }) {
  const top = rows
    .filter((r) => (kind === "up" ? deltaOf(r) > 0 : deltaOf(r) < 0))
    .sort((a, b) => (kind === "up" ? deltaOf(b) - deltaOf(a) : deltaOf(a) - deltaOf(b)))
    .slice(0, 8);
  return (
    <div className={"dash-col " + kind}>
      <div className="dash-h">
        <span className="lbl"><Icon d={icon} width="12" height="12" />{title}</span>
        <span className="cnt">{top.length || "none"}</span>
      </div>
      {top.length === 0 ? (
        <div className="empty" style={{ padding: "16px 12px" }}>
          no {kind === "up" ? "climbers" : "fallers"} in this snapshot
        </div>
      ) : top.map((r) => (
        <MoverRow key={r.id} r={r} holdingMap={holdingMap} fiatOf={fiatOf}
                  metaOf={metaOf} onOpen={onOpen} />
      ))}
    </div>
  );
}

/* Board heat: one square per creator in rank order, tinted by direction. The
   whole board in a single glanceable strip — hover/tap a square to see who. */
function HeatStrip({ rows, holdingMap, onOpen }) {
  return (
    <div className="heat-wrap">
      <div className="heat-h">
        <span className="lbl">board heat · rank 1 → {rows.length}</span>
        <span className="legend">
          <i className="sq up" />up <i className="sq dn" />down <i className="sq fl" />—
        </span>
      </div>
      <div className="heat" role="list">
        {rows.map((r) => {
          const d = deltaOf(r);
          return (
            <button
              key={r.id}
              role="listitem"
              className={"sq " + (d > 0 ? "up" : d < 0 ? "dn" : "fl") + (holdingMap[r.id] ? " held" : "")}
              title={`#${r.position} ${r.name} — ${d > 0 ? "+" + d : d < 0 ? d : "—"}`}
              aria-label={`${r.name}, rank ${r.position}, ${d > 0 ? "up " + d : d < 0 ? "down " + Math.abs(d) : "unchanged"}`}
              onClick={() => onOpen(r.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

/* Rank bands: the leaderboard sliced into readable tiers, so the feed reads
   like a market board (top 10 / 11-20 / 21-40 / 41+) instead of one long list. */
function RankBand({ from, to, rows, holdingMap, fiatOf, metaOf, onOpen, label }) {
  const band = rows.filter((r) => r.position >= from && r.position <= to);
  const moved = band.filter((r) => deltaOf(r) !== 0).length;
  return (
    <div className="band">
      <div className="dash-h">
        <span className="lbl">{label || `ranks ${from}–${to}`}</span>
        <span className="cnt">{band.length} · {moved} moved</span>
      </div>
      {band.length === 0 ? (
        <div className="empty" style={{ padding: "14px 12px" }}>rank band not on the board yet</div>
      ) : band.map((r) => (
        <MoverRow key={r.id} r={r} holdingMap={holdingMap} fiatOf={fiatOf}
                  metaOf={metaOf} onOpen={onOpen} />
      ))}
    </div>
  );
}

/* ---------- creator bio (feed cards) ----------
   Bios come from /api/bio, which reads Wikipedia. One request per board render
   for the visible names; if a creator has no page the card falls back to a line
   derived from the live board, never a made-up biography. */
function useBios(names) {
  const [bios, setBios] = useState({});
  const key = names.filter(Boolean).join("|");
  useEffect(() => {
    if (!key) return;
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/bio?names=${encodeURIComponent(key)}`);
        if (!r.ok) return;
        const d = await r.json();
        if (alive && d.bios) setBios((prev) => ({ ...prev, ...d.bios }));
      } catch { /* fallbacks carry the card */ }
    })();
    return () => { alive = false; };
  }, [key]);
  return bios;
}

/* Ribbon card: image-first tile with the rank label top-left, headline and BUY
   bottom-left, circular arrow top-right. Same geometry as the reference, but
   the image is the creator's real leaderboard photo. */
function RibbonCard({ r, kind, index, fiatOf, metaOf, onOpen, priceOf }) {
  const p = priceOf(r.position);
  const d = deltaOf(r);
  const meta = metaOf(r.name);
  const dir = kind === "up" ? "up" : "dn";
  return (
    <button
      className={"rb" + (index === 0 ? " lead" : "")}
      onClick={() => onOpen(r.id)}
      aria-label={`${r.name}, rank ${r.position}, ${fmt(p)} ${SYMBOL}`}
    >
      <span className="rb-img">
        <NameAvatar name={r.name} uuid={meta?.uuid} size={420} />
      </span>
      <span className="rb-shade" />
      <span className="rb-label">
        {String(index + 1).padStart(2, "0")} / {kind === "up" ? "up +" + d : "down " + (d || 0)}
      </span>
      <span className="rb-go"><Icon d={I.arrowUR} width="12" height="12" /></span>
      <span className="rb-body">
        <span className="rb-rank num">rank #{r.position} · {fmt(p)} {SYMBOL}</span>
        <span className="rb-nm">{r.name}</span>
        <span className="rb-sub">
          {kind === "up"
            ? (d > 0 ? `climbed ${d} place${d === 1 ? "" : "s"} this snapshot` : `holding #${r.position}`)
            : (d < 0 ? `dropped ${Math.abs(d)} place${Math.abs(d) === 1 ? "" : "s"} this snapshot` : `sitting at #${r.position}`)}
          {" · "}{fiatOf(p)}
        </span>
        <span className={"rb-btn " + dir}>BUY <Icon d={I.arrowUR} width="10" height="10" /></span>
      </span>
    </button>
  );
}

/* Showcase card: 4:3 tile, creator photo, name + rank over a bottom gradient,
   chevron top-right that flips open the bio panel inline. */
function ShowcaseCard({ r, fiatOf, metaOf, onOpen, priceOf, bio, wide }) {
  const [open, setOpen] = useState(false);
  const p = priceOf(r.position);
  const meta = metaOf(r.name);
  return (
    <div className={"sc" + (open ? " open" : "") + (wide ? " wide" : "")}>
      <button className="sc-face" onClick={() => setOpen((v) => !v)} aria-expanded={open}
              aria-label={`${r.name}, rank ${r.position}, ${open ? "hide" : "show"} bio`}>
        <span className="sc-img">
          <NameAvatar name={r.name} uuid={meta?.uuid} size={420} />
        </span>
        <span className="sc-shade" />
        <span className="sc-chev"><Icon d={I.chevD} width="12" height="12" /></span>
        <span className="sc-txt">
          <b>{r.name}</b>
          <span className="num">rank #{r.position} · {fmt(p)} {SYMBOL}</span>
        </span>
      </button>
      <div className="sc-bio">
        <p>
          {bio?.bio
            || `#${r.position} on the Motion board at ${fmt(p)} ${SYMBOL} a unit — rank sets the price, so every place is worth money.`}
        </p>
        <div className="sc-acts">
          <span className="sc-src">{bio ? "wikipedia" : "motion board"}</span>
          {bio?.url && (
            <a href={bio.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>read more ↗</a>
          )}
          <button className="sc-buy" onClick={() => onOpen(r.id)}>buy <Icon d={I.arrowUR} width="10" height="10" /></button>
        </div>
      </div>
    </div>
  );
}

/* Card interaction: equal thumbnails that widen on click to reveal the bio.
   Click a card, the row re-flows and that card's story slides out. */
function InteractionCards({ rows, fiatOf, metaOf, onOpen, priceOf, bios }) {
  const [open, setOpen] = useState(null);
  const list = rows.slice(0, 6);
  return (
    <div className="ic-row">
      {list.map((r, i) => {
        const on = open === r.id;
        const meta = metaOf(r.name);
        const bio = bios[r.name];
        return (
          <div
            key={r.id}
            className={"ic" + (on ? " on" : "")}
            onMouseEnter={() => setOpen(r.id)}
            onClick={() => setOpen(on ? null : r.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") setOpen(on ? null : r.id); }}
            aria-expanded={on}
          >
            <span className="ic-face">
              <span className="ic-img"><NameAvatar name={r.name} uuid={meta?.uuid} size={380} /></span>
              <span className="ic-shade" />
              <span className="ic-num">({i + 1})</span>
              <span className="ic-name">{r.name}</span>
            </span>
            <span className="ic-body">
              <span className="ic-rank num">rank #{r.position} · {fmt(priceOf(r.position))} {SYMBOL}</span>
              <h4>{r.name}</h4>
              <p>
                {bio?.bio
                  || `#${r.position} on the board at ${fmt(priceOf(r.position))} ${SYMBOL} a unit. Price is 1000 ÷ rank, so every place up is money.`}
              </p>
              <span className="ic-src">{bio ? "source · wikipedia" : "source · motion board"}</span>
              <button className="rb-btn" onClick={(e) => { e.stopPropagation(); onOpen(r.id); }}>
                BUY <Icon d={I.arrowUR} width="10" height="10" />
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function FeedView({
  rows, holdingMap, fiatOf, metaOf, feedTab, setFeedTab, onOpen,
  capturedAt, liveFresh, syncedAt, total,
}) {
  const up = rows.filter((r) => deltaOf(r) > 0).length;
  const down = rows.filter((r) => deltaOf(r) < 0).length;
  const still = rows.length - up - down;
  const movers = up + down;
  const held = rows.filter((r) => holdingMap[r.id]);
  const heat = rows.length ? (up / rows.length) * 100 : 0;

  /* Net board drift: sum of every rank delta. Positive means the top of the
     board is losing ground to the middle, negative the reverse. */
  const drift = rows.reduce((a, r) => a + deltaOf(r), 0);

  /* Biggest absolute moves, for the bar strip. */
  const chart = [...rows.filter((r) => deltaOf(r) !== 0)]
    .sort((a, b) => Math.abs(deltaOf(b)) - Math.abs(deltaOf(a)))
    .slice(0, 12);
  const maxAbs = Math.max(1, ...chart.map((r) => Math.abs(deltaOf(r))));

  /* Ribbon + showcase feeds read the board in rank order, and the interaction
     row reads the top of it — the names people actually recognise. */
  const priceOf = (rank) => 1000 / Math.max(1, Number(rank) || 1);
  const gainers = [...rows].filter((r) => deltaOf(r) > 0)
    .sort((a, b) => deltaOf(b) - deltaOf(a)).slice(0, 5);
  const losers = [...rows].filter((r) => deltaOf(r) < 0)
    .sort((a, b) => deltaOf(a) - deltaOf(b)).slice(0, 5);
  /* A perfectly still board still gets live cards — the top of the board stands
     in for the strip rather than showing an empty section. */
  const gainShow = gainers.length ? gainers : rows.slice(0, 5);
  const loseShow = losers.length ? losers : [...rows.slice(-5)].reverse();
  const showcaseRows = rows.slice(0, 8);
  const bioNames = [...new Set([...gainShow, ...loseShow, ...rows.slice(0, 6)].map((r) => r.name))];
  const bios = useBios(bioNames);
  const gainSum = gainers.reduce((a, r) => a + deltaOf(r), 0);
  const loseSum = losers.reduce((a, r) => a + Math.abs(deltaOf(r)), 0);

  return (
    <section className="pane">
      <div className="feed-hero">
        <div>
          <h2>Board pulse</h2>
          <p>
            Who is climbing, who is slipping, who is holding rank — every number is the live
            rank delta on the Motion board, not synthetic volume.
          </p>
        </div>
        <div className="feed-meta">
          <span>snapshot <b>{capturedAt ? clockOf(new Date(capturedAt).getTime()) : "—"}</b></span>
          <span>read <b>{clockOf(syncedAt)}</b></span>
          <span className="top-live">
            <i className={"dot" + (liveFresh ? "" : " stale")} />{liveFresh ? "live" : "sync"}
          </span>
        </div>
        <SocialShare
          url="https://mog-market.vercel.app/app"
          title="Motion Markets — attention is the asset, rank is the price."
          networks={["twitter", "whatsapp", "copylink"]}
          size={34}
          style="outline"
          effect="scale"
          align="right"
          class="feed-share"
        />
      </div>

      <div className="lp-stats feed-stats">
        <div className="lp-stat"><b className="num">{total}</b><span>creators on the board</span></div>
        <div className="lp-stat"><b className="num u">{up}</b><span>climbing · {heat.toFixed(0)}%</span></div>
        <div className="lp-stat"><b className="num d">{down}</b><span>slipping rank</span></div>
        <div className="lp-stat"><b className="num">{fmt(BigInt(Math.round(priceOf(1) * 1e6)) * 10n ** 12n, 0)}</b><span>top unit price · {SYMBOL}</span></div>
      </div>

      <HeatStrip rows={rows} holdingMap={holdingMap} onOpen={onOpen} />

      <div className="chips">
        <button className={"chip" + (feedTab === "movers" ? " on" : "")} onClick={() => setFeedTab("movers")}>top movers</button>
        <button className={"chip" + (feedTab === "bands" ? " on" : "")} onClick={() => setFeedTab("bands")}>rank bands</button>
        <button className={"chip" + (feedTab === "held" ? " on" : "")} onClick={() => setFeedTab("held")}>my holdings</button>
      </div>

      {feedTab === "movers" && (
        <>
          {/* ribbon cards: the five biggest climbs, image-first, BUY on each */}
          <div className="dash-h" style={{ marginTop: 4 }}>
            <span className="lbl"><Icon d={I.up} width="12" height="12" />top 5 movers</span>
            <span className="cnt">{gainers.length ? `+${gainSum} places` : "still board"}</span>
          </div>
          <div className="ribbon">
            {rows.length === 0 ? (
              <div className="empty" style={{ gridColumn: "1 / -1", padding: "20px 12px" }}>
                waiting for the first board read…
              </div>
            ) : gainShow.slice(0, 3).map((r, i) => (
              <RibbonCard key={r.id} r={r} kind="up" index={i} fiatOf={fiatOf}
                          metaOf={metaOf} onOpen={onOpen} priceOf={priceOf} />
            ))}
          </div>

          <div className="dash-h" style={{ marginTop: 16 }}>
            <span className="lbl"><Icon d={I.down} width="12" height="12" />top 5 losers</span>
            <span className="cnt">{losers.length ? `−${loseSum} places` : "no fallers"}</span>
          </div>
          <div className="ribbon">
            {rows.length === 0 ? (
              <div className="empty" style={{ gridColumn: "1 / -1", padding: "20px 12px" }}>
                waiting for the first board read…
              </div>
            ) : loseShow.slice(0, 3).map((r, i) => (
              <RibbonCard key={r.id} r={r} kind="down" index={i} fiatOf={fiatOf}
                          metaOf={metaOf} onOpen={onOpen} priceOf={priceOf} />
            ))}
          </div>

          {/* card interaction: click a face, the story slides out beside it */}
          <div className="dash-h" style={{ marginTop: 18 }}>
            <span className="lbl"><Icon d={I.feed} width="12" height="12" />who they are · click a card</span>
            <span className="cnt">{showcaseRows.length} faces</span>
          </div>
          <InteractionCards rows={rows.slice(0, 6)} fiatOf={fiatOf} metaOf={metaOf}
                            onOpen={onOpen} priceOf={priceOf} bios={bios} />

          <div className="dash-col" style={{ marginTop: 18 }}>
            <div className="dash-h">
              <span className="lbl"><Icon d={I.flame} width="12" height="12" />biggest moves</span>
              <span className="cnt">{chart.length} shown</span>
            </div>
            {chart.length === 0 ? (
              <div className="empty" style={{ padding: "16px 12px" }}>no rank changes in this snapshot</div>
            ) : (
              <div className="bars">
                {chart.map((r) => {
                  const d = deltaOf(r);
                  const w = (Math.abs(d) / maxAbs) * 100;
                  return (
                    <div key={r.id} className="bar-line" onClick={() => onOpen(r.id)}>
                      <span className="bar-nm">{r.name}</span>
                      <span className="bar-track">
                        <span className={"bar-fill" + (d < 0 ? " dn" : "")} style={{ width: `${Math.max(4, w)}%` }} />
                      </span>
                      <span className="bar-pct num">{deltaText(d)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {feedTab === "bands" && (
        <>
          {/* creator wall: the expanded-card band — the open card is the lead
              name with its bio line, the rest collapse to ranked strips. */}
          <div className="dash-h" style={{ marginTop: 4 }}>
            <span className="lbl"><Icon d={I.feed} width="12" height="12" />creator wall</span>
            <span className="cnt">{showcaseRows.length} preview · click a strip</span>
          </div>
          <ExpandedCard
            height={420}
            collapsedWidth={62}
            gap={9}
            radius={18}
            autoplay={false}
            cards={showcaseRows.map((r, i) => ({
              id: r.id,
              img: r?.uuid || metaOf(r.name)?.uuid
                ? `https://leaderboard.motion.game/pfp/${metaOf(r.name)?.uuid || r.uuid}.jpg`
                : null,
              index: String(i + 1).padStart(2, "0"),
              title: r.name,
              desc: bios[r.name]?.bio
                || `#${r.position} on the Motion board at ${fmt(priceOf(r.position))} ${SYMBOL} a unit — rank sets the price, so every place is worth money.`,
              meta: `rank #${r.position} · ${fmt(priceOf(r.position))} ${SYMBOL}`,
              onSelect: () => onOpen(r.id),
            }))}
          />

        <div className="dash">
          <RankBand from={1} to={10} label="top 10 · the head" rows={rows} holdingMap={holdingMap}
                    fiatOf={fiatOf} metaOf={metaOf} onOpen={onOpen} />
          <RankBand from={11} to={20} label="ranks 11–20 · the hot band" rows={rows} holdingMap={holdingMap}
                    fiatOf={fiatOf} metaOf={metaOf} onOpen={onOpen} />
          <RankBand from={21} to={40} label="ranks 21–40 · the climb" rows={rows} holdingMap={holdingMap}
                    fiatOf={fiatOf} metaOf={metaOf} onOpen={onOpen} />
          <RankBand from={41} to={Infinity} label="ranks 41+ · the tail" rows={rows} holdingMap={holdingMap}
                    fiatOf={fiatOf} metaOf={metaOf} onOpen={onOpen} />
        </div>
        </>
      )}

      {feedTab === "held" && (
        <div className="dash">
          <div className="dash-col">
            <div className="dash-h">
              <span className="lbl">your held creators</span>
              <span className="cnt">{held.length}</span>
            </div>
            {held.length === 0 ? (
              <div className="empty" style={{ padding: "16px 12px" }}>
                <b>nothing held yet</b>
                buy a creator in markets and their moves show up here.
              </div>
            ) : held.map((r) => (
              <MoverRow key={r.id} r={r} holdingMap={holdingMap} fiatOf={fiatOf}
                        metaOf={metaOf} onOpen={onOpen}
                        extra={`${holdingMap[r.id].units.toString()} units`} />
            ))}
          </div>
          <div className="dash-col">
            <div className="dash-h">
              <span className="lbl">held rank movement</span>
              <span className="cnt">{held.filter((r) => deltaOf(r) !== 0).length} moved</span>
            </div>
            {held.length === 0 ? (
              <div className="empty" style={{ padding: "16px 12px" }}>your book is empty</div>
            ) : held.map((r) => {
              const d = deltaOf(r);
              const w = Math.min(100, (Math.abs(d) / Math.max(1, ...held.map((h) => Math.abs(deltaOf(h))))) * 100);
              return (
                <div key={r.id} className="bar-line" onClick={() => onOpen(r.id)}>
                  <span className="bar-nm">{r.name}</span>
                  <span className="bar-track">
                    <span className={"bar-fill" + (d < 0 ? " dn" : d === 0 ? " fl" : "")} style={{ width: `${d === 0 ? 2 : Math.max(5, w)}%` }} />
                  </span>
                  <span className="bar-pct num">{deltaText(d)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

/* ----------------------------------------------------------- portfolio view */

/* Portfolio chart. Three reads of the same book:
   - bars: one bar per position, value or PnL, centred on zero
   - line: one sparkline per position over the archived rank series, so you can
     see the shape of the move you're holding
   - pnl: portfolio PnL over time, rebuilt from the archive (units × archived
     price × live FLUENT rate), so it tracks the whole book, not a snapshot
   Everything is drawn from real numbers — the archive and the live chain read. */
function PnlChart({ holdings, money, mode, setMode, rankHistory, usdOf }) {
  if (!holdings.length) return null;
  const maxAbs = Math.max(1, ...holdings.map((h) => Math.abs(Number(h.pnlUsd || 0))));
  const maxVal = Math.max(1, ...holdings.map((h) => Number(h.value) / 1e18));

  /* Portfolio PnL series: align every held creator's archived price by index of
     its own series, then sum units × (price − entry). Holdings without an entry
     price fall back to their first archived price, which is honest and labelled. */
  const pnlSeries = (() => {
    if (!rankHistory?.series) return [];
    const tracks = holdings.map((h) => {
      const pts = rankHistory.series[(h.name || "").trim().toLowerCase()]?.points || [];
      const entry = h.entry != null ? Number(h.entry) / 1e18 : (pts[0]?.price ?? null);
      return { units: Number(h.units), entry, prices: pts.map((p) => p.price) };
    }).filter((t) => t.prices.length > 0 && t.entry != null);
    if (!tracks.length) return [];
    const len = Math.max(...tracks.map((t) => t.prices.length));
    const out = [];
    for (let i = 0; i < len; i++) {
      let sum = 0;
      for (const t of tracks) {
        const px = t.prices[Math.min(i, t.prices.length - 1)];
        sum += t.units * (px - t.entry);
      }
      out.push(sum * usdOf(10n ** 18n));
    }
    return out;
  })();

  return (
    <div className="pnl-wrap">
      <div className="pnl-h">
        <span className="lbl">
          positions · {mode === "pnl" ? "profit & loss" : mode === "value" ? "book value" : mode === "line" ? "price path" : "pnl over time"}
        </span>
        <div className="chips">
          <button className={"chip" + (mode === "pnl" ? " on" : "")} onClick={() => setMode("pnl")}>pnl</button>
          <button className={"chip" + (mode === "value" ? " on" : "")} onClick={() => setMode("value")}>value</button>
          <button className={"chip" + (mode === "line" ? " on" : "")} onClick={() => setMode("line")}>chart</button>
          <button className={"chip" + (mode === "track" ? " on" : "")} onClick={() => setMode("track")}>pnl chart</button>
        </div>
      </div>

      {mode === "line" ? (
        <div className="pos-sparks">
          {holdings.map((h) => {
            const pts = (rankHistory?.series?.[(h.name || "").trim().toLowerCase()]?.points || []).map((p) => p.price);
            const first = pts[0], last = pts[pts.length - 1];
            const chg = pts.length > 1 ? last - first : 0;
            return (
              <div key={h.id} className="pos-spark">
                <span className="ps-nm">{h.name}</span>
                <span className={"ps-chg num " + (chg > 0 ? "u" : chg < 0 ? "d" : "")}>
                  {pts.length > 1 ? `${chg > 0 ? "+" : chg < 0 ? "−" : ""}${Math.abs(chg).toFixed(2)} ${SYMBOL}` : `— ${SYMBOL}`}
                </span>
                <RowSparkWide points={pts} />
              </div>
            );
          })}
        </div>
      ) : mode === "track" ? (
        pnlSeries.length > 1 ? (
          <>
            <div className="track-spark">
              <SparkFill values={pnlSeries} usd={(v) => money(v)} />
            </div>
            <div className="pnl-cap">
              portfolio pnl over the archived window · {pnlSeries.length} snapshots · hover for the value
            </div>
          </>
        ) : (
          <div className="spark-empty">
            pnl history needs a few archived snapshots — it fills in as the board moves
          </div>
        )
      ) : (
        <>
          <div className="pnl">
            {holdings.map((h) => {
              if (mode === "value") {
                const hgt = Math.max(3, (Number(h.value) / 1e18 / maxVal) * 100);
                return (
                  <div key={h.id} className="pnl-col" title={`${h.name}: ${fmt(h.value)} ${SYMBOL}`}>
                    <span className="pnl-tip num">{fmt(h.value, 0)}</span>
                    <span className="pnl-bar" style={{ height: `${hgt}%` }} />
                  </div>
                );
              }
              const pnlNum = Number(h.pnlUsd || 0);
              const hgt = Math.max(3, (Math.abs(pnlNum) / maxAbs) * 50);
              return (
                <div key={h.id} className="pnl-col" title={`${h.name}: ${pnlNum >= 0 ? "+" : "−"}${money(Math.abs(pnlNum))}`}>
                  <span className="pnl-tip num" style={{ color: pnlNum >= 0 ? "var(--up)" : "var(--down)" }}>
                    {pnlNum >= 0 ? "+" : "−"}{money(Math.abs(pnlNum))}
                  </span>
                  <span className={"pnl-bar " + (pnlNum >= 0 ? "pnl-pos" : "pnl-neg")} style={{ height: `${hgt}%` }} />
                </div>
              );
            })}
          </div>
          <div className="pnl-cap">
            {mode === "pnl" ? "zero line = entry cost" : "bar height = current book value"} · hover a bar for the exact figure
          </div>
        </>
      )}
    </div>
  );
}

function PortfolioView({
  holdings, entryKnown, netWorth, bookValue, balance, ethBalance, ethSymbol,
  fiatOf, fiatEth, money, metaOf, rankHistory, onPosition, goMarkets, currency, usdOf,
}) {
  const [mode, setMode] = useState("pnl");
  const totalPnl = holdings.reduce((a, h) => a + Number(h.pnlUsd || 0), 0);
  const best = [...holdings].sort((a, b) => Number(b.pnlUsd || 0) - Number(a.pnlUsd || 0))[0];

  return (
    <section className="pane">
      <div className="pane-h">
        <h2>Portfolio</h2>
        <span className="num">{holdings.length} open · {currency}</span>
      </div>

      <div className="pane-grid">
        <div className="pcard"><i>net worth</i><b className="num">{fmt(netWorth)}</b><em>{fiatOf(netWorth)}</em></div>
        <div className="pcard"><i>liquid {SYMBOL}</i><b className="num">{fmt(balance)}</b><em>{fiatOf(balance)}</em></div>
        <div className="pcard"><i>book value</i><b className="num">{fmt(bookValue)}</b><em>{fiatOf(bookValue)}</em></div>
        <div className="pcard"><i>gas ({ethSymbol})</i><b className="num">{fmt(ethBalance, 5)}</b><em>{fiatEth(ethBalance)}</em></div>
        {holdings.length > 0 && (
          <div className="pcard">
            <i>total pnl</i>
            <b className="num" style={{ color: totalPnl >= 0 ? "var(--up)" : "var(--down)" }}>
              {totalPnl >= 0 ? "+" : "−"}{money(Math.abs(totalPnl))}
            </b>
            <em>{entryKnown ? "vs entry price" : "vs first-seen price"}</em>
          </div>
        )}
      </div>

      {holdings.length > 0 ? (
        <>
          <PnlChart holdings={holdings} money={money} mode={mode} setMode={setMode}
                    rankHistory={rankHistory} usdOf={usdOf} />

          <div className="dash-col">
            <div className="dash-h">
              <span className="lbl">open positions</span>
              <span className="cnt">tap for details</span>
            </div>
            {holdings.map((h) => {
              const num = Number(h.pnlUsd || 0);
              return (
                <div key={h.id} className="mover" onClick={() => onPosition(h.id)}>
                  <span className="ix num">{h.position}</span>
                  <NameAvatar name={h.name} uuid={metaOf(h.name)?.uuid} size={24} />
                  <span style={{ minWidth: 0 }}>
                    <div className="nm">{h.name}</div>
                    <div className="sub num">{h.units.toString()} units · {fmt(h.price)} {SYMBOL}</div>
                  </span>
                  <span className="right">
                    <div className="d num" style={{ color: num >= 0 ? "var(--up)" : "var(--down)" }}>
                      {num >= 0 ? "+" : "−"}{money(Math.abs(num))}
                    </div>
                    <div className="px num">{fiatOf(h.value)}</div>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Trade receipts. Each open position gets a tear ticket: the body is
              the position (side, units, entry), the stub is its live PnL. Tear the
              stub to unfold the fill detail; share hands the receipt to the
              sleek social row. */}
          <div className="dash-col">
            <div className="dash-h">
              <span className="lbl">trade receipts · tear to open</span>
              <span className="cnt">{holdings.length} tickets</span>
            </div>
            <div className="tk-stack">
              {holdings.map((h) => {
                const num = Number(h.pnlUsd || 0);
                const entryPx = h.entry != null ? Number(h.entry) / 1e18 : null;
                const pct = h.pnlPct != null ? Number(h.pnlPct) : 0;
                return (
                  <TearTicket
                    key={h.id}
                    side={num < 0 ? "sell" : "buy"}
                    name={h.name}
                    handle={metaOf(h.name)?.uuid || ""}
                    qty={Number(h.units) / 1e18}
                    price={Number(h.price) / 1e18}
                    pnl={num}
                    pnlPct={pct}
                    quote={SYMBOL}
                    serial={`#${String(h.position).padStart(4, "0")}`}
                    when={Date.now()}
                    watermark={String(h.position).padStart(2, "0")}
                    realised={h.pnlAbs != null}
                    onShare={() => onPosition(h.id)}
                    class="tk-in-portfolio"
                  />
                );
              })}
            </div>
          </div>

          {best && Number(best.pnlUsd || 0) > 0 && (
            <div className="dash-col">
              <div className="dash-h"><span className="lbl">best performer</span></div>
              <div className="mover" onClick={() => onPosition(best.id)}>
                <span className="ix num">{best.position}</span>
                <NameAvatar name={best.name} uuid={metaOf(best.name)?.uuid} size={26} />
                <span style={{ minWidth: 0 }}>
                  <div className="nm">{best.name}</div>
                  <div className="sub num">{best.units.toString()} units</div>
                </span>
                <span className="right">
                  <div className="d num u">+{money(Number(best.pnlUsd || 0))}</div>
                  <div className="px num">{fiatOf(best.value)}</div>
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="dash-col">
          <div className="dash-h"><span className="lbl">no open positions</span></div>
          <div className="empty" style={{ padding: "18px" }}>
            <b>Nothing bought yet.</b>
            Every creator you hold shows up here with live value and P&L.
            <div style={{ marginTop: 10 }}>
              <button className="btn ghost" onClick={goMarkets}>open markets</button>
            </div>
          </div>
        </div>
      )}

      {rankHistory?.points > 0 && (
        <p className="pnl-cap num">
          rank history: {rankHistory.points} snapshots archived
          {rankHistory.window && ` · ${clockOf(new Date(rankHistory.window.from).getTime())}–${clockOf(new Date(rankHistory.window.to).getTime())}`}
        </p>
      )}
    </section>
  );
}

/* Position popup: opening a holding shows the trade in place, never navigates. */
/* Position popup: opening a holding shows the trade in place and lets you act on
   it, never navigating away. Buy/sell live right here in the sheet, so a tap in
   portfolio stays in portfolio — the markets tab is for discovery, not the only
   place you can trade. */
function PositionModal({
  h, row, metaOf, fiatOf, rankHistory, onClose, onTrade,
  selPrice, qty, units, setUnits, cost, fluent, trader, busy,
  onBuy, onSell, onClaim, onRefill, dripAmount, sheet,
}) {
  const num = Number(h.pnlUsd || 0);
  const pct = Number(h.pnlPct || 0);
  const series = rankHistory?.series?.[(h.name || "").trim().toLowerCase()]?.points || [];
  const price = selPrice ?? h.price;
  const heldUnits = h.units;
  const maxAfford = price > 0n ? Number(fluent?.balance / price) : 0;
  const canBuy = Boolean(fluent?.claimed) && fluent?.balance >= cost && !busy;
  const canSell = heldUnits > 0n && !busy;
  const links = socialLinks(h.name, metaOf(h.name));

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className={"modal wide pos-modal" + (sheet ? " sheet" : "")} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <span>your position · trade</span>
          <button className="modal-x" onClick={onClose} aria-label="close">×</button>
        </div>

        <div className="pos-top">
          <NameAvatar name={h.name} uuid={metaOf(h.name)?.uuid} size={46} />
          <div className="who-txt">
            <span className="rank num">rank #{h.position} · {fmt(price)} {SYMBOL}</span>
            <h4>{h.name}</h4>
            <span className="px num">{fiatOf(h.value)} book value</span>
          </div>
          <div className="tk-links">
            {links.filter((l) => l.found).map((l) => (
              <a key={l.k} className={l.k} href={l.url} target="_blank"
                 rel="noopener noreferrer nofollow" title={l.label} aria-label={l.label}>
                <SocGlyph k={l.k} />
              </a>
            ))}
          </div>
        </div>

        {series.length > 1 && (
          <div className="pos-swarm">
            <SwarmSpark points={series} w={300} hgt={44} />
            <div className="pnl-cap">price path · {series.length} archived snapshots</div>
          </div>
        )}

        <div className="pos-grid">
          <div className="pos-cell"><i>units held</i><b>{heldUnits.toString()}</b><em>units</em></div>
          <div className="pos-cell"><i>position value</i><b>{fmt(h.value)}</b><em>{SYMBOL}</em></div>
          <div className="pos-cell">
            <i>avg entry</i>
            <b>{h.entry != null ? fmt(h.entry) : "—"}</b>
            <em>{h.entry != null ? `${SYMBOL} / unit` : "not onchain"}</em>
          </div>
          <div className="pos-cell">
            <i>pnl vs cost</i>
            <b className={num >= 0 ? "u" : "d"}>
              {h.cost != null ? (num >= 0 ? "+" : "−") + money(Math.abs(num)) : "—"}
            </b>
            <em>{h.cost != null ? `${num >= 0 ? "+" : "−"}${Math.abs(pct).toFixed(1)}%` : "needs entry"}</em>
          </div>
        </div>

        {/* inline trade — the sheet is the ticket, no redirect */}
        <div className="qty-row">
          <span>units to trade</span>
          <div className="stepper">
            <button onClick={() => setUnits((u) => Math.max(1, (Number(u) || 1) - 1))} aria-label="minus">−</button>
            <input
              type="number" min="1" step="1" value={units} inputMode="numeric"
              onChange={(e) => setUnits(e.target.value === "" ? "" : Math.max(1, Math.floor(Number(e.target.value))))}
            />
            <button onClick={() => setUnits((u) => (Number(u) || 1) + 1)} aria-label="plus">+</button>
          </div>
        </div>
        <div className="qty-presets">
          {[1, 5, 10, 25].map((n) => (
            <button key={n} className={qty === n ? "on" : ""} onClick={() => setUnits(n)}>{n}</button>
          ))}
          <button className="max" onClick={() => setUnits(Math.max(1, maxAfford))} title="max affordable">max</button>
        </div>

        <div className="tk-sum">
          <div><span>price <u>per 1 unit</u></span><b className="num">{fmt(price)} {SYMBOL}</b></div>
          <div><span>units</span><b className="num">{qty} {qty === 1 ? "unit" : "units"}</b></div>
          <div><span>your balance</span><b className="num">{fmt(fluent?.balance ?? 0n)} {SYMBOL}</b></div>
          <div className="tot"><span>order total</span><b className="num">{fmt(cost)} {SYMBOL}</b></div>
          <div><span></span><em className="num">{fiatOf(cost)}</em></div>
        </div>

        {!fluent?.claimed ? (
          <button className="btn primary" disabled={busy || !fluent?.canClaim} onClick={onClaim}>
            {fluent?.busy ? "confirming…" : `claim ${fmt(dripAmount, 0)} ${SYMBOL}`}
          </button>
        ) : (
          <div className="tk-acts">
            <button className="btn buy-b" disabled={!canBuy} onClick={onBuy}>
              {trader?.busy ? "confirming…" : `buy ${qty}`}
            </button>
            <button className="btn sell-b" disabled={!canSell} onClick={() => onSell(false)}>
              {heldUnits === 0n ? "sell" : `sell ${Math.min(qty, Number(heldUnits))}`}
            </button>
          </div>
        )}
        {heldUnits > 0n && (
          <button className="linkbtn" onClick={() => onSell(true)}>
            close full position ({heldUnits.toString()} units)
          </button>
        )}
        {fluent?.claimed && fluent?.balance < cost && (
          <div className="warn">
            not enough {SYMBOL} — <button className="linkbtn" onClick={onRefill}>request a drip</button>
          </div>
        )}
        {trader?.txError && <div className="warn err">{trader.txError}</div>}

        <p className="pos-note">
          Rank #{h.position} fixes the unit price at 1000 ÷ rank. One step up is worth{" "}
          {fmt(priceOf(Math.max(1, h.position - 1)))} {SYMBOL} per unit.
        </p>

        <div className="pos-acts">
          <button className="btn ghost" onClick={onClose}>close</button>
          <button className="btn ghost" onClick={onClose}>back to portfolio</button>
        </div>
      </div>
    </div>
  );
}

/* Swarm sparkline: the creator's own price path, compact form, drawn from the
   archived rank series. Every card carries its own swarm shape so the board
   reads as a wall of movement instead of a list of numbers. */
function SwarmSpark({ points, w = 96, hgt = 24 }) {
  const vals = (points || []).map((p) => p.price).filter((n) => Number.isFinite(n));
  if (vals.length < 2) {
    return (
      <svg className="rspark swarm" viewBox={`0 0 ${w} ${hgt}`} preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1={hgt / 2} x2={w} y2={hgt / 2} className="ln f" />
      </svg>
    );
  }
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const pt = vals.map((v, i) => [(i / (vals.length - 1)) * w, hgt - ((v - min) / span) * (hgt - 3) - 1.5]);
  const d = pt.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const trend = vals[vals.length - 1] - vals[0];
  const dir = trend > 0 ? "u" : trend < 0 ? "d" : "f";
  const [ex, ey] = pt[pt.length - 1];
  const area = `${d} L${w},${hgt} L0,${hgt} Z`;
  return (
    <svg className={"rspark swarm " + dir} viewBox={`0 0 ${w} ${hgt}`} preserveAspectRatio="none"
         aria-label={`price path ${trend > 0 ? "up" : trend < 0 ? "down" : "flat"}, ${vals.length} snapshots`}>
      <path className={"swarm-area " + dir} d={area} />
      <path className={"ln " + dir} d={d} />
      <circle cx={ex} cy={ey} r="1.8" className={"dot-e " + dir} />
    </svg>
  );
}

/* Wider variant of the row sparkline, used in the portfolio chart tab: same
   honest geometry, larger box and an end dot so the latest point is obvious. */
function RowSparkWide({ points }) {
  const w = 220, hgt = 34;
  if (!points || points.length < 2) {
    return (
      <svg className="rspark wide" viewBox={`0 0 ${w} ${hgt}`} preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1={hgt / 2} x2={w} y2={hgt / 2} className="ln f" />
      </svg>
    );
  }
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const pt = points.map((v, i) => [(i / (points.length - 1)) * w, hgt - ((v - min) / span) * (hgt - 4) - 2]);
  const d = pt.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const trend = points[points.length - 1] - points[0];
  const [ex, ey] = pt[pt.length - 1];
  return (
    <svg className="rspark wide" viewBox={`0 0 ${w} ${hgt}`} preserveAspectRatio="none" aria-hidden="true">
      <path className={"ln " + (trend > 0 ? "u" : trend < 0 ? "d" : "f")} d={d} />
      <circle cx={ex} cy={ey} r="2.4" className={"dot-e " + (trend > 0 ? "u" : trend < 0 ? "d" : "f")} />
    </svg>
  );
}

/* Filled area chart for the portfolio PnL timeline. Signs are honest: the fill
   sits above or below the zero line depending on where the series ends. */
function SparkFill({ values, usd }) {
  const w = 320, hgt = 96;
  const min = Math.min(...values, 0), max = Math.max(...values, 0);
  const span = max - min || 1;
  const y0 = hgt - ((0 - min) / span) * hgt;
  const pt = values.map((v, i) => [(i / Math.max(1, values.length - 1)) * w, hgt - ((v - min) / span) * hgt]);
  const line = pt.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L${w},${y0.toFixed(2)} L0,${y0.toFixed(2)} Z`;
  const last = values[values.length - 1];
  const trend = last - values[0];
  return (
    <>
      <svg className="spark fill" viewBox={`0 0 ${w} ${hgt}`} preserveAspectRatio="none" role="img"
           aria-label={`portfolio pnl ${trend >= 0 ? "up" : "down"} ${usd(Math.abs(trend))}`}>
        <line x1="0" y1={y0} x2={w} y2={y0} className="zero" />
        <path className={"area " + (trend >= 0 ? "u" : "d")} d={area} />
        <path className={"ln " + (trend >= 0 ? "u" : "d")} d={line} />
      </svg>
      <div className="spark-legend num">
        <span>start {usd(values[0])}</span>
        <span className={trend >= 0 ? "u" : "d"}>
          {trend >= 0 ? "+" : "−"}{usd(Math.abs(trend))} since first snapshot
        </span>
        <span>now {usd(last)}</span>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- drip modal */

function DripModal({ fluent, dripAmount, money, usdOf, onClose, onClaim, onRefill }) {
  const next = fluent.cooldownRemaining;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <span>testnet faucet</span>
          <button className="modal-x" onClick={onClose} aria-label="close">×</button>
        </div>
        <div className="drip-grid">
          <div className="drip-card">
            <i>{SYMBOL} · drip</i>
            <b className="num">{fmt(dripAmount, 0)}</b>
            <em>{money(usdOf(dripAmount))} · once per 12 h</em>
            {!fluent.claimed ? (
              <button className="btn primary" disabled={fluent.busy || !fluent.canClaim} onClick={onClaim}>
                {fluent.busy ? "confirming…" : "claim"}
              </button>
            ) : (
              <button className="btn ghost" disabled={fluent.busy || next > 0} onClick={onRefill}>
                {next > 0 ? `next in ${hhmm(next)}` : "request drip"}
              </button>
            )}
          </div>
          <div className="drip-card">
            <i>gas · ETH</i>
            <b className="num">{fmt(fluent.ethBalance, 5)}</b>
            <em>testnet ETH pays the gas — claim it from Fluent</em>
            <a className="btn ghost" href={GAS_FAUCET_URL} target="_blank" rel="noopener noreferrer">
              fluent faucet ↗
            </a>
          </div>
        </div>
        <p className="modal-p">
          Your {SYMBOL} balance is <b className="num">{fmt(fluent.balance)}</b>. The drip cooldown is
          per wallet — the next one lands {next > 0 ? `in ${hhmm(next)}` : "any time"}.
        </p>
      </div>
    </div>
  );
}

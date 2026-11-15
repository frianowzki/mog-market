"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LiquidGlassButton from "../src/components/LiquidGlassButton.jsx";
import CrestGallery from "../src/components/CrestGallery.jsx";
import SocialShare from "../src/components/SocialShare.jsx";
import GooeyNav from "../src/components/GooeyNav.jsx";
import Faq from "../src/components/Faq.jsx";
import SwatchAccordion from "../src/components/SwatchAccordion.jsx";
import TextMotion, { CountUp, ScrambleText } from "../src/components/TextMotion.jsx";
import "../src/components/liquid-glass.css";
import "../src/components/crest-gallery.css";
import "../src/components/social-share.css";
import "../src/components/gooey-nav.css";
import "../src/components/faq.css";
import "../src/components/swatch-accordion.css";
import "./landing.css";
import "./landing-framer.css";
import "./landing-wiring.css";

const BOARD_API = "/api/motion/leaderboard";
const pfpOf = (id) => (id ? `https://leaderboard.motion.game/pfp/${id}.jpg` : null);
const priceOf = (rank) => 1000 / Math.max(1, Number(rank) || 1);

const money = (n) =>
  n >= 1000 ? n.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : n.toLocaleString("en-US", { maximumFractionDigits: 2 });

const ArrowUpRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);
const Mark = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17l5-6 4 4 5-8 4 5" />
  </svg>
);

export default function Landing() {
  const [board, setBoard] = useState({ rows: [], at: null });
  const [bios, setBios] = useState({});
  const [openCard, setOpenCard] = useState(null);

  /* The landing reads the same board endpoint the terminal does, so the numbers
     on the marketing page are the live ones — never a hardcoded sample. */
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(BOARD_API, { headers: { accept: "application/json" }, cache: "no-store" });
        if (!r.ok) return;
        const d = await r.json();
        if (alive && Array.isArray(d.rows)) setBoard({ rows: d.rows, at: d.capturedAt || null });
      } catch { /* keep the last read */ }
    };
    load();
    const t = setInterval(load, 30_000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const rows = board.rows;
  const top = useMemo(() => rows.slice(0, 8), [rows]);

  /* Bios are fetched once per board — Wikipedia summaries, one server call for
     the visible subset, cached for a day upstream. */
  const bioKey = top.map((r) => r.name).join("|");
  useEffect(() => {
    if (!bioKey) return;
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/bio?names=${encodeURIComponent(bioKey)}`);
        if (!r.ok) return;
        const d = await r.json();
        if (alive && d.bios) setBios((prev) => ({ ...prev, ...d.bios }));
      } catch { /* cards fall back to their rank line */ }
    })();
    return () => { alive = false; };
  }, [bioKey]);

  const gainers = useMemo(
    () => [...rows].filter((r) => Number(r.delta) > 0).sort((a, b) => Number(b.delta) - Number(a.delta)).slice(0, 5),
    [rows],
  );
  const losers = useMemo(
    () => [...rows].filter((r) => Number(r.delta) < 0).sort((a, b) => Number(a.delta) - Number(b.delta)).slice(0, 5),
    [rows],
  );
  /* If the board is perfectly still, still show live cards rather than an empty
     section: the top five become the strip. */
  const gainShow = gainers.length ? gainers : rows.slice(0, 5);
  const loseShow = losers.length ? losers : rows.slice(-5).reverse();
  const climbing = rows.filter((r) => Number(r.delta) > 0).length;
  const slipping = rows.filter((r) => Number(r.delta) < 0).length;
  const total = rows.length;

  /* The crest wants enough cards to fill the band and then some, so it takes a
     wider slice than the old static wall did — still straight off the board. */
  const gallery = useMemo(() => {
    const pick = rows.filter((r) => pfpOf(r.id)).slice(0, 14);
    return pick.length >= 5 ? pick : rows.slice(0, 14);
  }, [rows]);

  const img = (r) => pfpOf(r?.id);
  const bg = (r) => (img(r) ? { backgroundImage: `url(${img(r)})` } : { background: "linear-gradient(140deg,#2a2118,#4a3320)" });

  /* nav sections — the gooey pill tracks whichever one is in view */
  const [nav, setNav] = useState("board");
  const NAV_ITEMS = useMemo(() => ([
    { k: "board", label: "board" },
    { k: "creators", label: "creators" },
    { k: "how", label: "how it works" },
    { k: "faq", label: "faq" },
  ]), []);

  useEffect(() => {
    const ids = NAV_ITEMS.map((n) => n.k);
    const io = new IntersectionObserver((entries) => {
      const hit = entries.filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (hit) setNav(hit.target.id);
    }, { rootMargin: "-45% 0px -45% 0px", threshold: [0.01, 0.25, 0.5] });
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [NAV_ITEMS]);

  const goSection = (k) => {
    const el = document.getElementById(k);
    if (!el) return;
    setNav(k);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* the mobile creator deck — same rows as the card grid, reshaped for the
     swatch accordion: one panel open, the rest collapsed to a strip */
  const deck = useMemo(() => top.map((r) => ({
    id: r.id,
    rank: r.position,
    name: r.name,
    img: pfpOf(r.id),
    tint: (Number(r.delta) || 0) > 0 ? "#3f9d5a" : (Number(r.delta) || 0) < 0 ? "#a84b32" : "#8a7f2a",
    bio: (bios[r.name]?.bio || "").trim().slice(0, 170)
      || `#${r.position} on the Motion board. Price is rank-locked, so an upward move in the feed is an upward move in the book.`,
    price: `${money(priceOf(r.position))} FLUENT`,
    tags: [
      Number(r.delta) > 0 ? `+${Number(r.delta).toFixed(1)}%` : `${Number(r.delta || 0).toFixed(1)}%`,
      "rank priced",
    ],
    onBuy: () => { window.location.href = "/app"; },
  })), [top, bios]);

  /* FAQ copy is written for this market, not pasted from a template — every
     answer reflects how Motion Markets actually settles. */
  const FAQ_ITEMS = useMemo(() => ([
    {
      id: "what",
      q: "What is Motion Markets, exactly?",
      a: "A price board for attention. Every creator on the Motion leaderboard becomes a share class whose price is 1000 ÷ rank, so a creator who climbs from #40 to #20 doubles in price without anyone trading it. You buy the climb before the rest of the feed notices.",
      links: [{ label: "open the terminal", href: "/app" }],
    },
    {
      id: "price",
      q: "How does the price actually move?",
      a: "Rank is the only input. The board re-snapshots the live leaderboard onchain, and price is derived from the new rank — no order book decides it, no market maker quotes it. If a creator holds rank, price holds; if they slip, so does the price.",
    },
    {
      id: "buy",
      q: "How do I buy a creator?",
      a: "Sign in with X to get a wallet (or connect one you already have), then pick a creator on the board and buy units at the current rank price. Position, average entry, and PnL stay in the portfolio tab — buying never navigates you away from the terminal.",
    },
    {
      id: "faucet",
      q: "Do I need real FLUENT to try it?",
      a: "No. The market is live on Fluent testnet, and the faucet in the rail drips testnet FLUENT on a cooldown so you can open a position the same minute you sign in. Nothing here touches mainnet funds.",
    },
    {
      id: "fees",
      q: "What does trading cost?",
      a: "Only the gas the chain charges for the transaction. There is no platform fee, no spread, and no deposit or withdrawal step — your units sit in your own wallet, and you can read every trade on fluentscan.",
    },
    {
      id: "sell",
      q: "Can I get out whenever I want?",
      a: "Yes. Selling returns testnet FLUENT at the price implied by the creator's current rank, so you are always liquid at the board price. The one risk is honest: if the creator drops in rank while you hold, the exit price drops with them.",
    },
    {
      id: "rank",
      q: "What decides who is on the board?",
      a: "The Motion leaderboard does — the board is a mirror, not a jury. New names appear as the leaderboard re-snapshots, and each snapshot is pushed onchain so the ranks you trade against are the ones everyone else sees.",
      links: [{ label: "view the live board", href: "#board" }],
    },
  ]), []);


  return (
    <div className="lp">
      {/* mist: three drifting, heavily blurred ribbons over near-black */}
      <div className="lp-mist" aria-hidden="true"><span /><span /><span /></div>
      <div className="lp-grain" aria-hidden="true" />
      <div className="lp-vig" aria-hidden="true" />

      <div className="lp-inner">
        {/* liquid gooey nav: the pill melts between sections as you scroll,
            and the terminal CTA rides the right edge of the same capsule */}
        <div className="lp-navwrap">
          <GooeyNav
            items={NAV_ITEMS}
            active={nav}
            onChange={goSection}
            accent="#d7ff3e"
            brand={<>Motion <i>Markets</i></>}
            right={
              <Link className="lp-pill solid goo-cta" href="/app">
                enter terminal <ArrowUpRight />
              </Link>
            }
          />
        </div>

        <header className="lp-hero">
          <span className="lp-eyebrow"><i className="dot" /> live on fluent testnet</span>
          <h1>
            <TextMotion preset="rise" split="char" stagger={26} duration={900} as="span" className="tm-line">
              Attention is the asset.
            </TextMotion>
            <br />
            <TextMotion preset="rise" split="word" stagger={90} delay={280} duration={900} as="span" className="tm-line">
              {"Rank is the "}
            </TextMotion>
            <TextMotion preset="blur-up" split="word" stagger={80} delay={820} duration={1000} as="em">
              price
            </TextMotion>
            <TextMotion preset="fade" split="char" stagger={14} delay={980} duration={600} as="span">
              .
            </TextMotion>
          </h1>
          <TextMotion preset="fade-up" split="word" stagger={22} delay={520} duration={800} as="p" className="lp-hero-sub">
            Every creator on the Motion leaderboard is a share class. Price is 1000 ÷ rank,
            rebalanced with the board. Buy the climb before the rest of the feed notices.
          </TextMotion>
          <div className="lp-cta">
            <LiquidGlassButton
              href="/app"
              variant="tinted"
              size="lg"
              trailing={<ArrowUpRight />}
              style={{ "--acc": "#d7ff3e" }}
            >
              open the terminal
            </LiquidGlassButton>
            <LiquidGlassButton href="#board" variant="clear" size="lg">
              see today&apos;s movers
            </LiquidGlassButton>
          </div>

          <div className="lp-stats" id="board">
            <div className="lp-stat"><b className="num">{total || "—"}</b><span>creators live</span></div>
            <div className="lp-stat"><b className="num u">{climbing || "—"}</b><span>climbing rank</span></div>
            <div className="lp-stat"><b className="num d">{slipping || "—"}</b><span>slipping rank</span></div>
            <div className="lp-stat"><b className="num">1000 ÷ n</b><span>price model</span></div>
          </div>
        </header>

        {/* ---------------------------------------------- top movers ribbons */}
        <section className="lp-section" id="movers">
          <div className="lp-shead">
            <div>
              <h2>Top 5 movers</h2>
              <p>Biggest rank gains on the live board — the lead card is today&apos;s jump.</p>
            </div>
            <Link className="lp-pill" href="/app">trade these <ArrowUpRight /></Link>
          </div>
          <div className="l-ribbon">
            {gainShow.slice(0, 3).map((r, i) => (
              <Link key={r.id} className={"l-rb" + (i === 0 ? " lead" : "")} href="/app">
                <span className="l-rb-img" style={bg(r)} />
                <span className="l-rb-shade" />
                <span className="l-rb-label">{String(i + 1).padStart(2, "0")} / up +{Number(r.delta)}</span>
                <span className="l-rb-go"><ArrowUpRight /></span>
                <span className="l-rb-body">
                  <span className="l-rb-rank">rank #{r.position} · {money(priceOf(r.position))} FLUENT</span>
                  <h3>{r.name}</h3>
                  <p>
                    {Number(r.delta) > 0
                      ? `Climbed ${Number(r.delta)} place${Number(r.delta) === 1 ? "" : "s"} this snapshot.`
                      : `Holding #${r.position} on a still board.`}
                  </p>
                  <span className="l-rb-btn">buy <ArrowUpRight /></span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="lp-section">
          <div className="lp-shead">
            <div>
              <h2>Top 5 losers</h2>
              <p>Rank bleeds first. These are the names slipping — price follows.</p>
            </div>
          </div>
          <div className="l-ribbon">
            {loseShow.slice(0, 3).map((r, i) => (
              <Link key={r.id} className={"l-rb" + (i === 0 ? " lead" : "")} href="/app">
                <span className="l-rb-img" style={bg(r)} />
                <span className="l-rb-shade" />
                <span className="l-rb-label">
                  {String(i + 1).padStart(2, "0")} / down {Number(r.delta)}
                </span>
                <span className="l-rb-go"><ArrowUpRight /></span>
                <span className="l-rb-body">
                  <span className="l-rb-rank">rank #{r.position} · {money(priceOf(r.position))} FLUENT</span>
                  <h3>{r.name}</h3>
                  <p>
                    {Number(r.delta) < 0
                      ? `Dropped ${Math.abs(Number(r.delta))} place${Math.abs(Number(r.delta)) === 1 ? "" : "s"} this snapshot.`
                      : `Sitting at #${r.position} on a still board.`}
                  </p>
                  <span className="l-rb-btn dn">buy the dip <ArrowUpRight /></span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ------------------------------------------- showcase: creator wall */}
        <section className="lp-section" id="creators">
          <div className="lp-shead">
            <div>
              <h2>The board</h2>
              <p>Every creator, every rank, priced live. Faces straight off the leaderboard.</p>
            </div>
            <Link className="lp-pill" href="/app">all {total || ""} creators <ArrowUpRight /></Link>
          </div>
          <CrestGallery
            items={gallery.map((r) => ({
              id: r.id || r.name,
              img: img(r),
              title: r.name,
              caption: `rank #${r.position} · ${money(priceOf(r.position))} F`,
              onClick: () => { window.location.href = "/app"; },
            }))}
            height={430}
            width={296}
            gap={26}
          />
        </section>

        {/* ------------------------------- card interaction: click reveals bio */}
        <section className="lp-section" id="how">
          <div className="lp-shead">
            <div>
              <h2>
                <TextMotion preset="fade-up" split="word" stagger={60} as="span">
                  Click a card. Read the story.
                </TextMotion>
              </h2>
              <p>Every creator opens on a real biography — sourced, not generated.</p>
            </div>
          </div>

          {/* phones get the swatch deck: one creator open, the rest collapsed to
              a strip you can swipe. Wider screens keep the four-up card grid. */}
          <div className="l-deck">
            <SwatchAccordion items={deck} onChange={(i, it) => setOpenCard(it.id)} />
          </div>

          <div className="lp-cards l-cards-desktop">
            {top.slice(0, 4).map((r, i) => {
              const bio = bios[r.name];
              const on = openCard === r.id;
              return (
                <div
                  key={r.id}
                  className={"l-ic" + (on ? " on" : "")}
                  onMouseEnter={() => setOpenCard(r.id)}
                  onClick={() => setOpenCard(on ? null : r.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") setOpenCard(on ? null : r.id); }}
                >
                  <span className="l-ic-face">
                    <span className="l-ic-img" style={bg(r)} />
                    <span className="l-ic-shade" />
                    <span className="l-ic-num">({i + 1})</span>
                    <span className="l-ic-name">{r.name}</span>
                  </span>
                  <span className="l-ic-body">
                    <span className="l-ic-rank">rank #{r.position} · {money(priceOf(r.position))} FLUENT</span>
                    <h4>{r.name}</h4>
                    <p>
                      {bio?.bio
                        || (rows.length
                          ? `#${r.position} on the Motion board, priced at ${money(priceOf(r.position))} FLUENT a unit. Price moves with rank, so every place is worth money.`
                          : "Loading the board…")}
                    </p>
                    <span className="l-ic-src">
                      {bio ? "source · wikipedia" : "source · motion board"}
                    </span>
                    <a
                      className="l-rb-btn"
                      href="/app"
                      onClick={(e) => e.stopPropagation()}
                    >
                      buy <ArrowUpRight />
                    </a>
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------------------- faq */}
        <section className="lp-section" id="faq">
          <Faq
            eyebrow="the fine print"
            title={<>Questions, <em>answered</em>.</>}
            intro="Everything about how rank becomes price, and what actually settles onchain."
            items={FAQ_ITEMS}
            defaultOpenIndex={0}
          />
        </section>


        <section className="lp-close">
          <h2>Rank is the only <em>fundamental</em>.</h2>
          <p>Fluent Testnet · settled onchain · 5,000 FLUENT faucet every 12 hours.</p>
          <LiquidGlassButton
            href="/app"
            variant="frost"
            size="lg"
            trailing={<ArrowUpRight />}
            class="lp-close-cta"
          >
            enter the terminal
          </LiquidGlassButton>

          <div className="lp-share">
            <SocialShare
              url="https://mog-market.vercel.app"
              title="Motion Markets — attention is the asset, rank is the price."
              networks={["twitter", "linkedin", "whatsapp", "copylink"]}
              size={42}
              style="brand"
              effect="slide"
              label="pass the board on"
            />
          </div>
        </section>

        <footer className="lp-foot">
          <span>Motion Markets · Fluent Testnet</span>
          <span>
            <a href="https://testnet.fluentscan.xyz" target="_blank" rel="noopener noreferrer">fluentscan ↗</a>
            {"  ·  "}
            <a href="https://leaderboard.motion.game" target="_blank" rel="noopener noreferrer">motion leaderboard ↗</a>
          </span>
        </footer>
      </div>
    </div>
  );
}

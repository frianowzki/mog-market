"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LiquidGlassButton from "../src/components/LiquidGlassButton.jsx";
import CrestGallery from "../src/components/CrestGallery.jsx";
import SocialShare from "../src/components/SocialShare.jsx";
import "../src/components/liquid-glass.css";
import "../src/components/crest-gallery.css";
import "../src/components/social-share.css";
import "./landing.css";
import "./landing-framer.css";

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

  return (
    <div className="lp">
      {/* mist: three drifting, heavily blurred ribbons over near-black */}
      <div className="lp-mist" aria-hidden="true"><span /><span /><span /></div>
      <div className="lp-grain" aria-hidden="true" />
      <div className="lp-vig" aria-hidden="true" />

      <div className="lp-inner">
        <nav className="lp-nav">
          <span className="lp-brand"><Mark /> Motion <i>Markets</i></span>
          <span className="lp-navlinks">
            <a href="#board">board</a>
            <a href="#creators">creators</a>
            <a href="#buy">how it works</a>
            <Link className="lp-pill solid" href="/app">enter terminal <ArrowUpRight /></Link>
          </span>
        </nav>

        <header className="lp-hero">
          <span className="lp-eyebrow"><i className="dot" /> live on fluent testnet</span>
          <h1>
            Attention is the asset.<br />
            Rank is the <em>price</em>.
          </h1>
          <p>
            Every creator on the Motion leaderboard is a share class. Price is 1000 ÷ rank,
            rebalanced with the board. Buy the climb before the rest of the feed notices.
          </p>
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
        <section className="lp-section" id="buy">
          <div className="lp-shead">
            <div>
              <h2>Click a card. Read the story.</h2>
              <p>Every creator opens on a real biography — sourced, not generated.</p>
            </div>
          </div>
          <div className="l-cards">
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

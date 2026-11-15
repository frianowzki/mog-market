export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/board — the live Motion leaderboard, shaped for the terminal.
 *
 * The chain has no per-creator history, so movement (rank delta, top movers)
 * has to come from Motion. Upstream already publishes a rolling snapshot
 * (~2 min cadence, delta vs a 4h baseline) — we pass it through with a tiny
 * CDN cache so every client polling at 5-10s costs one upstream call a minute,
 * not one per browser. Chain rows are the source of truth for names/ranks;
 * this route only enriches them.
 */

const MOTION_API = "https://leaderboard.motion.game/api/leaderboard";

const X_HANDLES = {
  ishowspeed: "ishowspeed", elonmusk: "elonmusk", mrbeast: "mrbeast",
  cristiano: "cristiano", kyliejenner: "kyliejenner", arianagrande: "arianagrande",
  therock: "therock", selenagomez: "selenagomez", justinbieber: "justinbieber",
  taylorswift13: "taylorswift13", rihanna: "rihanna", katyperry: "katyperry",
  jtimberlake: "jtimberlake", kaicenat: "kaicenat", ludwig: "ludwig",
  "marquesbrownlee": "mkbhd", "patmcafee": "patmcafeeshow", "lexfridman": "lexfridman",
  "bryanjohnson": "bryanjohnson", "druski": "druski", "sneako": "sneako",
};

const slug = (s) => String(s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

function socials(name) {
  const h = X_HANDLES[slug(name)] || X_HANDLES[String(name || "").trim().toLowerCase()] || null;
  return h
    ? { x: { url: `https://x.com/${h}`, handle: "@" + h, verified: true } }
    : { x: { url: `https://x.com/search?q=${encodeURIComponent(name || "")}&f=user`, handle: null, verified: false } };
}

export async function GET() {
  try {
    const r = await fetch(MOTION_API, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const d = await r.json();
    const rows = (Array.isArray(d.rows) ? d.rows : []).map((row) => ({
      id: row.id,
      name: row.name,
      position: Number(row.position) || 0,
      delta: Number(row.delta) || 0,
      isNew: Boolean(row.isNew),
      pfp: `https://leaderboard.motion.game/pfp/${row.id}.jpg`,
      socials: socials(row.name),
    }));
    return Response.json(
      {
        asOf: d.asOf || null,
        capturedAt: d.capturedAt || new Date().toISOString(),
        baselineCapturedAt: d.baselineCapturedAt || null,
        rows,
        fetchedAt: new Date().toISOString(),
      },
      { headers: { "cache-control": "public, s-maxage=8, stale-while-revalidate=60" } }
    );
  } catch (e) {
    return Response.json(
      { rows: [], error: String(e?.message || e), fetchedAt: new Date().toISOString() },
      { status: 200, headers: { "cache-control": "no-store" } }
    );
  }
}

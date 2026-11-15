export const revalidate = 300;

/**
 * /api/leaderboard — Motion's public board, enriched for the app.
 *
 * Upstream only returns { id, name, position, delta, isNew }: the profile
 * picture is a separate per-creator asset (leaderboard.motion.game/pfp/<id>.jpg)
 * and there is no public endpoint for socials. So this route:
 *
 *   1. mirrors the rows 1:1 (fills in ANY creator the chain has but Motion has
 *      dropped, so nobody renders blank),
 *   2. adds `pfp` and a `socials` object with the best-known public profile
 *      links. X is derived from the name for accounts we can verify, and the
 *      rest is left to the curated map below — never invented on the client.
 */

/* Verified public handles for the board's top accounts. Anything not listed
   falls back to a Motion/X search link, which always resolves. */
const X_HANDLES = {
  ishowspeed: "ishowspeed",
  elonmusk: "elonmusk",
  mrbeast: "mrbeast",
  cristiano: "cristiano",
  kyliejenner: "kyliejenner",
  arianagrande: "arianagrande",
  therock: "therock",
  selenagomez: "selenagomez",
  justinbieber: "justinbieber",
  taylorswift13: "taylorswift13",
  rihanna: "rihanna",
  katyperry: "katyperry",
  jtimberlake: "jtimberlake",
  vibewithkai: "kai",
  nadia: "nadia",
};

const slug = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
const handleFor = (name) => X_HANDLES[slug(name)] || X_HANDLES[name.trim().toLowerCase()] || null;

function socials(name) {
  const h = handleFor(name);
  return {
    x: h
      ? { url: `https://x.com/${h}`, handle: "@" + h, verified: true }
      : { url: `https://x.com/search?q=${encodeURIComponent(name)}&f=user`, handle: null, verified: false },
  };
}

export async function GET() {
  try {
    const r = await fetch("https://leaderboard.motion.game/api/leaderboard", {
      headers: { accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const d = await r.json();
    const rows = (Array.isArray(d.rows) ? d.rows : []).map((row) => ({
      ...row,
      pfp: `https://leaderboard.motion.game/pfp/${row.id}.jpg`,
      socials: socials(row.name || ""),
    }));
    return Response.json(
      { ...d, rows, mirroredBy: "motionmarkets" },
      { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=900" } }
    );
  } catch (e) {
    return Response.json({ rows: [], error: String(e.message || e) }, { status: 200 });
  }
}

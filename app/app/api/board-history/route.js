export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/board-history — rolling rank history, built by us.
 *
 * Motion publishes a snapshot a few times an hour but no history endpoint, so
 * this route is the archive: every call it re-reads the live board, remembers
 * it in a small in-memory history (last ~4 hours of snapshots, or the last 60
 * capturedAt stamps) and returns each creator's rank series. The terminal draws
 * its charts from that series — never from invented data. Cold starts return a
 * single point; the series fills in as the instance lives.
 */

const MOTION_API = "https://leaderboard.motion.game/api/leaderboard";
const MAX_POINTS = 60;

/* Module-scoped: survives between requests on a warm function instance. */
let history = []; // [{ at, rows: [{ name, position }] }]

export async function GET() {
  try {
    const r = await fetch(MOTION_API, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const d = await r.json();
    const rows = Array.isArray(d.rows) ? d.rows : [];
    const at = d.asOf || d.capturedAt || new Date().toISOString();

    const snap = {
      at,
      delta: d.baselineCapturedAt || null,
      rows: rows.map((x) => ({
        name: String(x.name || "").trim().toLowerCase(),
        label: x.name,
        position: Number(x.position) || 0,
        delta: Number(x.delta) || 0,
      })),
    };

    if (!history.some((h) => h.at === at)) {
      history = [...history, snap].slice(-MAX_POINTS);
    }

    /* Per-creator series of price (1000/rank) and rank. */
    const byName = new Map();
    for (const h of history) {
      for (const row of h.rows) {
        if (!byName.has(row.name)) byName.set(row.name, { name: row.label || row.name, points: [] });
        if (row.position > 0) {
          byName.get(row.name).points.push({
            at: h.at,
            rank: row.position,
            price: 1000 / row.position,
          });
        }
      }
    }

    return Response.json(
      {
        capturedAt: at,
        points: history.length,
        window: history.length ? { from: history[0].at, to: history[history.length - 1].at } : null,
        series: Object.fromEntries(byName),
      },
      { headers: { "cache-control": "public, s-maxage=30, stale-while-revalidate=120" } }
    );
  } catch (e) {
    return Response.json(
      { error: "fetch_failed", message: String(e?.message || e), series: {}, points: 0 },
      { status: 200 }
    );
  }
}

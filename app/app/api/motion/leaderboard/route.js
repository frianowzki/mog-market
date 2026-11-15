export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MOTION_API = "https://leaderboard.motion.game/api/leaderboard";

export async function GET() {
  try {
    const res = await fetch(MOTION_API, {
      headers: { accept: "application/json" },
      // Revalidate-ish: don't hammer upstream, but keep reasonably fresh.
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return Response.json(
        { error: "upstream_error", status: res.status },
        { status: 502 }
      );
    }
    const data = await res.json();
    return Response.json(data, {
      headers: {
        "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    return Response.json(
      { error: "fetch_failed", message: String(err?.message || err) },
      { status: 502 }
    );
  }
}

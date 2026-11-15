import { NextResponse } from "next/server";

/**
 * Avatar resolver for creators Motion has no picture for.
 *
 * Motion serves /pfp/<uuid>.jpg for most of the board, but ~10% of creators
 * have no asset there (404). For those we fall back to the official social
 * profile picture:
 *
 *   1. fxtwitter for a verified handle (only when the handle is in the
 *      allowlist below — we never guess someone's X account), which gives the
 *      real pbs.twimg.com avatar at 400px.
 *   2. unavatar.io as a generic resolver for the remaining handles.
 *
 * The result is a 302 to the upstream image so the browser caches it directly,
 * and we cache the resolution for a day to stay well inside free-tier limits.
 */

export const revalidate = 86400;

/* Verified: handle checked against the board entry (name + follower scale). */
const HANDLES = {
  "david senra": "davidsenra",
};

/* Generic picture proxy as a last resort for the confirmed handle only. */
const PROXY = "https://unavatar.io/x/";

const redirect = (u) => NextResponse.redirect(u, 302);

export async function GET(req) {
  const name = (new URL(req.url).searchParams.get("name") || "").trim();
  const handle = HANDLES[name.toLowerCase()];
  if (!handle) {
    return new NextResponse("no verified source for this creator", { status: 404 });
  }

  /* fxtwitter is the only source that returns the real avatar URL, but it is
     flaky from serverless (cold DNS, occasional 5xx) — so bound it tightly and
     fall back to the unavatar proxy rather than hanging the avatar request. */
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 2500);
    const r = await fetch(`https://api.fxtwitter.com/${handle}`, {
      headers: { "user-agent": "motionmarkets/1.0" },
      signal: ctl.signal,
      next: { revalidate: 86400 },
    });
    clearTimeout(t);
    if (r.ok) {
      const d = await r.json();
      const a = d?.user?.avatar_url;
      // a default egg means no real avatar — let the client keep its monogram
      if (a && !/default_profile|sticky/.test(a)) {
        return redirect(a.replace("_normal.", "_400x400."));
      }
    }
  } catch { /* slow or down → proxy below */ }

  return redirect(PROXY + handle);
}

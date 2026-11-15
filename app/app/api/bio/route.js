export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Creator bios for the feed cards.
   Source of truth is Wikipedia's REST summary endpoint, which is CORS-free from
   the server and gives a real one-paragraph extract. Nothing is invented: when
   Wikipedia has no matching page we say so and let the UI fall back to a rank
   description derived from the board itself.

   Cached hard — bios do not change every three seconds, and hammering Wikipedia
   would get us rate-limited. One upstream call per creator per day. */

const WIKI = "https://en.wikipedia.org/api/rest_v1/page/summary/";
const TTL_MS = 24 * 60 * 60 * 1000;
const cache = globalThis.__mmBioCache || (globalThis.__mmBioCache = new Map());

const clean = (s) =>
  String(s || "")
    .replace(/\s+(may refer to|refers to)\s*:?/gi, ":")
    .replace(/\(\s*listen\s*\)/gi, "")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, " ")
    .trim();

async function fromWikipedia(name) {
  const title = String(name || "").trim().replace(/\s+/g, "_");
  if (!title) return null;
  const res = await fetch(WIKI + encodeURIComponent(title), {
    headers: { accept: "application/json", "user-agent": "motion-markets/1.0 (bios)" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const d = await res.json();
  if (!d || d.type === "disambiguation" || !d.extract) return null;
  const extract = clean(d.extract);
  /* Guard against a wrong page: the extract has to at least mention the name or
     a recognisable chunk of it, otherwise we'd attribute a stranger's bio. */
  const words = String(name).toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const hay = extract.toLowerCase();
  const hits = words.filter((w) => hay.includes(w)).length;
  if (words.length && hits === 0) return null;
  return {
    bio: extract.length > 320 ? extract.slice(0, 317).replace(/[\s,.]+\S*$/, "") + "…" : extract,
    source: "wikipedia",
    url: d.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    thumb: d.thumbnail?.source || null,
  };
}

async function searchWikipedia(name) {
  /* Exact-title hit first, then Wikipedia's own search so a handle like
     "MrBeast" still resolves to the page whose title is "MrBeast". */
  const direct = await fromWikipedia(name);
  if (direct) return direct;
  try {
    const r = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&format=json&origin=*&srlimit=1`,
      { headers: { accept: "application/json" }, next: { revalidate: 86400 } },
    );
    if (!r.ok) return null;
    const d = await r.json();
    const hit = d?.query?.search?.[0]?.title;
    if (!hit) return null;
    if (hit.toLowerCase() === String(name).toLowerCase()) return null;
    const found = await fromWikipedia(hit);
    return found ? { ...found, matchedTitle: hit } : null;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("names") || "";
  const names = [...new Set(raw.split("|").map((n) => n.trim()).filter(Boolean))].slice(0, 24);

  const out = {};
  await Promise.all(
    names.map(async (name) => {
      const key = name.toLowerCase();
      const hit = cache.get(key);
      if (hit && Date.now() - hit.at < TTL_MS) { out[name] = hit.value; return; }
      try {
        const value = await searchWikipedia(name);
        /* Cache the miss too — otherwise every card without a page re-queries
           on every board poll. */
        cache.set(key, { at: Date.now(), value });
        out[name] = value;
      } catch (e) {
        out[name] = null;
      }
    }),
  );

  return Response.json(
    { bios: out },
    { headers: { "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}

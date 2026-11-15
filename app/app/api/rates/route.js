export const revalidate = 300;   // fx moves slowly; cache 5 min per edge region

const FALLBACK = {
  bySymbol: { FLUENT: 0.0476, ETH: 1813, USDT: 1, USDC: 1 },
  rates: { USD: 1, IDR: 16100, EUR: 0.92, GBP: 0.79, SGD: 1.34, JPY: 155, INR: 88, MYR: 4.4, AUD: 1.55, CNY: 7.2 },
};

/* Display currencies we offer in the UI. Kept in sync with src/Terminal.jsx. */
const CURRENCIES = ["USD", "IDR", "EUR", "GBP", "SGD", "JPY", "INR", "MYR", "AUD", "CNY"];

/**
 * /api/rates — spot + fiat table for the wallet card.
 *
 * ETH/USDT/USDC come from CoinGecko's simple/price endpoint (the one that still
 * answers without a key), and the fiat table from the same response so a single
 * USD figure can be re-expressed in the user's currency. FLUENT is quoted from
 * its mainnet pair on dexscreener because it has no CoinGecko listing.
 */
export async function GET() {
  const out = {
    bySymbol: { ...FALLBACK.bySymbol },
    rates: { ...FALLBACK.rates },
    at: new Date().toISOString(),
    source: "snapshot",
  };

  try {
    const vs = ["usd", "idr", "eur", "gbp", "sgd", "jpy", "inr", "myr", "aud", "cny"].join(",");
    const r = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether,usd-coin&vs_currencies=${vs}`,
      { headers: { accept: "application/json" }, next: { revalidate: 300 } }
    );
    if (r.ok) {
      const d = await r.json();
      const eth = d?.ethereum || {};
      if (eth.usd) {
        out.bySymbol.ETH = Number(eth.usd);
        out.bySymbol.USDT = Number(d?.["tether"]?.usd) || 1;
        out.bySymbol.USDC = Number(d?.["usd-coin"]?.usd) || 1;
        // eth.<fiat> gives the whole fiat table in one shot
        for (const c of CURRENCIES) {
          const k = c.toLowerCase();
          if (eth[k]) out.rates[c] = Number(eth[k]);
        }
        out.rates.USD = 1;
        out.source = "coingecko";
      }
    }
  } catch { /* keep snapshot */ }

  try {
    const r = await fetch(
      "https://api.dexscreener.com/tokens/v1/ethereum/0xd8A271974E8EdAE9D7b58e3370dc1669427503F4",
      { next: { revalidate: 300 } }
    );
    if (r.ok) {
      const pairs = await r.json();
      const best = (Array.isArray(pairs) ? pairs : [])
        .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
      if (best?.priceUsd) {
        out.bySymbol.FLUENT = Number(best.priceUsd);
        out.source = out.source === "snapshot" ? "dexscreener" : `${out.source}+dexscreener`;
      }
    }
  } catch { /* keep snapshot */ }

  return Response.json(out, {
    headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}

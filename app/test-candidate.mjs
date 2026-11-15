// Test the candidate fix on the LIVE dom before committing: closed pill must
// size to avatar+name, open card must still reveal the info column.
import { chromium } from "playwright";

const CANDIDATE = `
.mpc:not(.open) .mpc-info {
  flex: 0 0 0;
  width: 0;
  max-width: 0;
  padding-inline: 0;
  overflow: hidden;
}
`;

const browser = await chromium.launch();
for (const [name, w, h] of [["d1280", 1280, 900], ["m390", 390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto("https://mog-market.vercel.app/app?shot=1", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForSelector(".deck-row .mpc", { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(2200);

  const probe = () => page.evaluate(() => {
    const pills = [...document.querySelectorAll(".deck-row .mpc")];
    const closed = pills.filter((p) => !p.classList.contains("open"));
    const first = closed[0];
    const rest = first?.querySelector(".mpc-rest");
    const open = document.querySelector(".deck-row .mpc.open");
    const name = open?.querySelector(".mpc-name");
    const bio = open?.querySelector(".mpc-bio");
    const r = (n) => (n ? { w: Math.round(n.getBoundingClientRect().width), scrollW: n.scrollWidth, text: (n.textContent||"").trim().slice(0,12) } : null);
    return {
      pillW: Math.round(first.getBoundingClientRect().width),
      rest: r(rest),
      truncated: rest ? rest.scrollWidth > rest.clientWidth + 1 : null,
      openName: r(name), openBio: r(bio),
      openH: open ? Math.round(open.getBoundingClientRect().height) : null,
    };
  });

  const before = await probe();
  await page.addStyleTag({ content: CANDIDATE });
  await page.waitForTimeout(400);
  const afterClosed = await probe();

  // now open one and check the info column still shows
  await page.evaluate(() => document.querySelector(".deck-row .mpc:not(.open)").click());
  await page.waitForTimeout(900);
  const afterOpen = await probe();

  console.log(name, "\n  before:", JSON.stringify(before), "\n  afterCls:", JSON.stringify(afterClosed), "\n  afterOpen:", JSON.stringify(afterOpen));
  await page.screenshot({ path: `cand-${name}.png` });
  await ctx.close();
}
await browser.close();

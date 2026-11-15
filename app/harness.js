// Real render harness for the proof page. Plain ES module — it imports the
// SWC-built components so what runs here is byte-for-byte the code the Next
// build compiles, just without the web3 provider tree.
import React from "react";
import { createRoot } from "react-dom/client";
import SocialShare from "./proof-build/SocialShare.js";
import LiquidGlassButton from "./proof-build/LiquidGlassButton.js";
import ExpandedCard from "./proof-build/ExpandedCard.js";
import TearTicket from "./proof-build/TearTicket.js";
import CrestGallery from "./proof-build/CrestGallery.js";

const h = React.createElement;
const P = (id) => `https://leaderboard.motion.game/pfp/${id}.jpg`;

const cards = [
  { id: "ba610970-8b9e-5959-9d6a-d0a6eb6be4a4", img: "https://leaderboard.motion.game/pfp/ba610970-8b9e-5959-9d6a-d0a6eb6be4a4.jpg", index: "01", title: "IShowSpeed", desc: "Placed #1 on the Motion board at 1000.0 FLUENT a unit — rank sets the price, so every place is worth money.", meta: "rank #1 · 1000.0 FLUENT" }, { id: "02ff07d3-a15c-533a-b0c0-9e628761218a", img: "https://leaderboard.motion.game/pfp/02ff07d3-a15c-533a-b0c0-9e628761218a.jpg", index: "02", title: "Marques Brownlee", desc: "Placed #2 on the Motion board at 500.0 FLUENT a unit — rank sets the price, so every place is worth money.", meta: "rank #2 · 500.0 FLUENT" }, { id: "b53942ba-71a6-5169-a79b-6fda7b52674f", img: "https://leaderboard.motion.game/pfp/b53942ba-71a6-5169-a79b-6fda7b52674f.jpg", index: "03", title: "Ludwig", desc: "Placed #3 on the Motion board at 333.33 FLUENT a unit — rank sets the price, so every place is worth money.", meta: "rank #3 · 333.33 FLUENT" }, { id: "a65b356a-1f71-589f-b12e-08d278462b30", img: "https://leaderboard.motion.game/pfp/a65b356a-1f71-589f-b12e-08d278462b30.jpg", index: "04", title: "Pat McAfee", desc: "Placed #4 on the Motion board at 250.0 FLUENT a unit — rank sets the price, so every place is worth money.", meta: "rank #4 · 250.0 FLUENT" }, { id: "d59b284b-deca-5612-996e-0f3c2aae3ec1", img: "https://leaderboard.motion.game/pfp/d59b284b-deca-5612-996e-0f3c2aae3ec1.jpg", index: "05", title: "Zohran Mamdani", desc: "Placed #5 on the Motion board at 200.0 FLUENT a unit — rank sets the price, so every place is worth money.", meta: "rank #5 · 200.0 FLUENT" }, { id: "edebdfa3-784f-5482-8b27-5675f55c4545", img: "https://leaderboard.motion.game/pfp/edebdfa3-784f-5482-8b27-5675f55c4545.jpg", index: "06", title: "Kai Cenat", desc: "Placed #6 on the Motion board at 166.67 FLUENT a unit — rank sets the price, so every place is worth money.", meta: "rank #6 · 166.67 FLUENT" }, { id: "26092401-8724-5c9d-8378-ad8a24fb6293", img: "https://leaderboard.motion.game/pfp/26092401-8724-5c9d-8378-ad8a24fb6293.jpg", index: "07", title: "Lex Fridman", desc: "Placed #7 on the Motion board at 142.86 FLUENT a unit — rank sets the price, so every place is worth money.", meta: "rank #7 · 142.86 FLUENT" }, { id: "13e67500-bbcb-52b4-9c2a-d001b8d2fa86", img: "https://leaderboard.motion.game/pfp/13e67500-bbcb-52b4-9c2a-d001b8d2fa86.jpg", index: "08", title: "Bryan Johnson", desc: "Placed #8 on the Motion board at 125.0 FLUENT a unit — rank sets the price, so every place is worth money.", meta: "rank #8 · 125.0 FLUENT" },
];

const gallery = cards.map((c, i) => ({ id: c.id, img: c.img, title: c.title, caption: `rank #${i + 1} · ${1000 / (i + 1)} F` }));

const blk = (n, title, ...kids) =>
  h("div", { className: "blk" },
    h("div", { className: "cap" }, h("b", null, n), title),
    ...kids);

const App = () =>
  h(React.Fragment, null,
    blk("01", " sleek social share",
      h("div", { className: "stage" },
        h(SocialShare, { url: "https://mog-market.vercel.app", title: "Motion Markets", label: "share the board", size: 44, style: "brand", effect: "scale" }),
        h("div", { style: { height: 22 } }),
        h(SocialShare, { url: "https://mog-market.vercel.app", title: "Motion Markets", size: 38, style: "outline", effect: "slide", networks: ["twitter", "linkedin", "facebook", "whatsapp", "email", "copylink"] }),
        h("div", { style: { height: 22 } }),
        h(SocialShare, { url: "https://mog-market.vercel.app", title: "Motion Markets", size: 34, style: "monochrome", effect: "press", networks: ["twitter", "copylink"] }))),

    blk("02", " liquid glass buttons",
      h("div", { className: "stage" },
        h("div", { className: "row" },
          h(LiquidGlassButton, { href: "#a", variant: "tinted", size: "lg", trailing: "↗" }, "open the terminal"),
          h(LiquidGlassButton, { href: "#b", variant: "clear", size: "lg" }, "see today's movers"),
          h(LiquidGlassButton, { href: "#c", variant: "frost", size: "lg" }, "frost")),
        h("div", { style: { height: 20 } }),
        h("div", { className: "row" },
          h(LiquidGlassButton, { variant: "clear", size: "sm" }, "small clear"),
          h(LiquidGlassButton, { variant: "tinted", size: "md" }, "tinted md"),
          h(LiquidGlassButton, { variant: "frost", size: "sm", disabled: true }, "disabled")))),

    blk("03", " expanded card · creator wall",
      h(ExpandedCard, { cards, height: 420, collapsedWidth: 62, gap: 9, radius: 18 })),

    blk("04", " tear ticket · trade receipt with pnl",
      h("div", { style: { display: "grid", gap: 20 } },
        h(TearTicket, { side: "buy", name: "MrBeast", handle: "mrbeast", qty: 12.5, price: 1000, quote: "FLUENT", serial: "#0001", when: Date.now(), watermark: "01", onShare: () => {} }),
        h(TearTicket, { side: "sell", name: "Kai Cenat", handle: "kaicenat", qty: 40, price: 500, pnl: 1420.55, pnlPct: 7.1, quote: "FLUENT", serial: "#0002", when: Date.now(), watermark: "02", torn: true, onShare: () => {} }),
        h(TearTicket, { side: "sell", name: "Adin Ross", handle: "adinross", qty: 18, price: 90, pnl: -318.2, pnlPct: -19.6, quote: "FLUENT", serial: "#0003", when: Date.now(), watermark: "11", onShare: () => {} }))),

    blk("05", " crest gallery · creators from the board",
      h(CrestGallery, { items: gallery, height: 420, width: 280, gap: 26 })));

createRoot(document.getElementById("root")).render(h(App));

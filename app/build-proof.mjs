// Pre-transpile the ported components to browser ES modules for the proof page.
// SWC (Next's compiler) does the JSX transform; the output keeps the bare
// "react" import so the page's import map resolves it to esm.sh.
import swc from "next/dist/build/swc/index.js";
import fs from "node:fs/promises";
import path from "node:path";

const files = [
  "src/components/SocialShare.jsx",
  "src/components/LiquidGlassButton.jsx",
  "src/components/ExpandedCard.jsx",
  "src/components/TearTicket.jsx",
  "src/components/CrestGallery.jsx",
];

await fs.mkdir("proof-build", { recursive: true });
for (const f of files) {
  const src = await fs.readFile(f, "utf8");
  const out = swc.transformSync(src, {
    filename: f,
    jsc: {
      parser: { syntax: "ecmascript", jsx: true },
      transform: { react: { runtime: "automatic", importSource: "react" } },
    },
    module: { type: "es6" },
    isModule: true,
  });
  const name = path.basename(f, ".jsx") + ".js";
  await fs.writeFile(path.join("proof-build", name), out.code);
  console.log("->", name, out.code.length);
}

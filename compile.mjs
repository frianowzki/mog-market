#!/usr/bin/env node
/** Compiles chain/contracts/*.sol with solc-js and writes artifacts to chain/artifacts/. */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "chain", "contracts");
const OUT = join(ROOT, "chain", "artifacts");
mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC).filter(f => f.endsWith(".sol"));
const sources = {};
for (const f of files) sources[f] = { content: readFileSync(join(SRC, f), "utf8") };

const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] } },
  },
};

const out = JSON.parse(solc.compile(JSON.stringify(input)));
const errs = (out.errors || []).filter(e => e.severity === "error");
if (errs.length) {
  for (const e of errs) console.error(e.formattedMessage);
  process.exit(1);
}
for (const w of (out.errors || []).filter(e => e.severity === "warning")) {
  console.warn("warn:", w.formattedMessage.split("\n")[0]);
}

let count = 0;
for (const [file, contracts] of Object.entries(out.contracts || {})) {
  for (const [name, c] of Object.entries(contracts)) {
    const artifact = {
      contractName: name,
      source: file,
      abi: c.abi,
      bytecode: "0x" + c.evm.bytecode.object,
      deployedBytecode: "0x" + c.evm.deployedBytecode.object,
    };
    writeFileSync(join(OUT, name + ".json"), JSON.stringify(artifact, null, 2));
    const kb = ((artifact.bytecode.length - 2) / 2 / 1024).toFixed(1);
    console.log(`✓ ${name}  bytecode ${kb} KB  abi ${c.abi.length} entries`);
    count++;
  }
}
console.log(`compiled ${count} contract(s) with solc ${solc.version()}`);

"use client";

import dynamic from "next/dynamic";

// The whole terminal is wallet-gated (Privy + wagmi), so it can only render in
// the browser. Loading it client-only keeps the SSR shell tiny and lets Next
// code-split the heavy web3 vendor chunk away from the first paint.
const Terminal = dynamic(() => import("../src/Terminal.jsx").then((m) => m.Terminal), {
  ssr: false,
  loading: () => <div className="center-msg">initialising…</div>,
});

export default function Page() {
  return <Terminal />;
}

"use client";

/* Preview harness: renders the terminal with stubbed wallet data so the
   wallet-gated layout can be inspected (and screenshotted) without a real
   Privy session. Enabled only when ?preview=1 is on the URL. */

import { useMemo } from "react";
import { TerminalPreview } from "../../src/Shell.jsx";

export default function PreviewPage() {
  const enabled = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("preview") === "1";
  }, []);
  if (!enabled) return <div className="center-msg">preview disabled</div>;
  return <TerminalPreview />;
}

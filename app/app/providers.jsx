"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { wagmiConfig } from "../src/wagmi.js";
import { fluentTestnet } from "../src/chain.js";

const PRIVY_APP_ID = (process.env.NEXT_PUBLIC_PRIVY_APP_ID || "").trim();

export default function Providers({ children }) {
  // QueryClient must be stable per browser session, not shared across requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
      })
  );

  if (!PRIVY_APP_ID) {
    return (
      <div className="login-wrap">
        <h2>Setup needed</h2>
        <p>
          This build has no Privy App ID. Create an app at{" "}
          <a href="https://dashboard.privy.io" target="_blank" rel="noreferrer">
            dashboard.privy.io
          </a>
          , enable the X login method, then set <b>NEXT_PUBLIC_PRIVY_APP_ID</b> and rebuild.
        </p>
        <p className="num" style={{ fontSize: 11, color: "var(--mute)" }}>
          optional: NEXT_PUBLIC_CONTRACT_ADDRESS for the deployed MogMarket
        </p>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["twitter", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#8c1d18",
          logo: undefined,
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
        defaultChain: fluentTestnet,
        supportedChains: [fluentTestnet],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

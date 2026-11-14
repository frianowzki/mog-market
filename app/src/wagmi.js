import { http } from "viem";
import { createConfig } from "@privy-io/wagmi";
import { fluentTestnet } from "./chain.js";

export const wagmiConfig = createConfig({
  chains: [fluentTestnet],
  transports: { [fluentTestnet.id]: http() },
});

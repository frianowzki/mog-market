import { defineChain } from "viem";

export const fluentTestnet = defineChain({
  id: 20994,
  name: "Fluent Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.fluent.xyz"] },
  },
  blockExplorers: {
    default: { name: "Fluentscan", url: "https://testnet.fluentscan.xyz" },
  },
  testnet: true,
});

export const EXPLORER = fluentTestnet.blockExplorers.default.url;

import { instrumentSerif, archivo, jetbrainsMono } from "./fonts.js";
import Providers from "./providers.jsx";
import "./styles.css";

export const metadata = {
  title: "MOG MARKET — trade the Motion leaderboard",
  description:
    "$1,000 of paper capital, settled onchain. Buy creators on the Motion leaderboard, hold across snapshots, cash out higher.",
  openGraph: {
    title: "MOG MARKET",
    description: "Trade the Motion leaderboard, settled onchain on Fluent Testnet.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MOG MARKET",
    description: "Trade the Motion leaderboard, settled onchain on Fluent Testnet.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f1ea",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${archivo.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

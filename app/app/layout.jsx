import { instrumentSerif, archivo, jetbrainsMono } from "./fonts.js";
import Providers from "./providers.jsx";
import "./styles.css";

export const metadata = {
  title: "Motion Markets — trade the top KOLs on X",
  description:
    "Motion Markets: trade the Motion leaderboard of top KOLs on X, settled onchain on Fluent Testnet.",
  openGraph: {
    title: "Motion Markets",
    description: "Trade the Motion leaderboard of top KOLs on X, settled onchain on Fluent Testnet.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Motion Markets",
    description: "Trade the Motion leaderboard of top KOLs on X, settled onchain on Fluent Testnet.",
  },
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

import Landing from "./Landing.jsx";

export const metadata = {
  title: "Motion Markets — attention is the asset, rank is the price",
  description:
    "Trade the Motion leaderboard of top KOLs on X, settled onchain on Fluent Testnet. Price is 1000 ÷ rank, rebalanced with the board.",
  openGraph: {
    title: "Motion Markets",
    description:
      "Every creator on the Motion leaderboard is a share class. Price is 1000 ÷ rank. Trade the climb.",
    type: "website",
  },
};

export default function Page() {
  return <Landing />;
}

# MOG MARKET — onchain

Paper-trading game for the Motion leaderboard, settled on **Fluent Testnet** (chain `20994`).
Sign in with **X** via Privy; a wallet is created for you automatically.

## What's here

```
chain/contracts/MogMarket.sol   the game contract (rank => price, buy/sell/enroll)
chain/artifacts/                compiled ABI + bytecode (gitignored)
compile.mjs                     solc-js compile step
deploy.mjs                      deploy + seed the board from api.json
app/                            React + Vite + Privy + wagmi front end
index.html                      the original offline single-file version
```

## Contract model

- Price of creator at rank `r` is `1000e18 / r`. Rank is the only state that moves,
  so price is always derived — it can never be stale.
- `enroll()` grants `1000e18` paper dollars once per address.
- `buy(id, units)` / `sell(id, units)` move paper cash against real testnet ETH
  held by the contract. Excess `msg.value` is refunded in the same tx.
- `syncBoard(ids, ranks, deltas)` is owner-only and writes a whole snapshot in one tx.

## Setup

### 1. Compile

```bash
node compile.mjs
```

### 2. Fund a deployer

```bash
node deploy.mjs          # prints a generated address, then exits
```

Copy that address and get testnet ETH from <https://testnet.fluent.xyz/faucet>,
then re-run:

```bash
node deploy.mjs
```

It deploys, seeds all creators from `api.json`, and writes `chain/deployments.json`.

### 3. Privy app

1. Create an app at <https://dashboard.privy.io>.
2. **Login methods** → enable **X (Twitter)**.
3. **Allowed origins** → add your dev and prod origins
   (`http://localhost:5173`, `https://mog-market.vercel.app`).
4. **Embedded wallets** → Ethereum, create on login for users without wallets.

### 4. Run the app

```bash
cd app
cat > .env <<'EOF'
VITE_PRIVY_APP_ID=clxxxxxxxxxxxxxxxx
VITE_CONTRACT_ADDRESS=0x...
EOF
pnpm install
pnpm dev
```

## Deploy to Vercel

Set both `VITE_PRIVY_APP_ID` and `VITE_CONTRACT_ADDRESS` in the project's
environment variables, root directory `app`, build `pnpm build`, output `dist`.

## Refreshing the board

Prices follow rank. To push a new snapshot onchain:

```bash
node update-snapshot.mjs     # refresh api.json from the live leaderboard
node deploy.mjs --seed-only  # push the new ranks to the existing contract
```

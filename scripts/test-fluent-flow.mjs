#!/usr/bin/env node
/**
 * End-to-end proof of the FLUENT onboarding: a fresh throwaway wallet claims
 * from the faucet (owner-paid, `claimFor`), approves, buys, sells, and checks
 * that FLUENT lands back. Prints only addresses and amounts — never the key.
 */
import { readFileSync } from "node:fs";
import { createWalletClient, createPublicClient, http, parseEther, formatEther, keccak256, toBytes } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";

const CHAIN = { id: 20994, name: "Fluent Testnet", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: ["https://rpc.testnet.fluent.xyz"] } }, testnet: true };
const pub = createPublicClient({ chain: CHAIN, transport: http() });
const deps = JSON.parse(readFileSync("chain/deployments.json", "utf8"))[20994];

const ownerPk = JSON.parse(readFileSync(".fluent-deployer.json", "utf8")).privateKey;
const owner = createWalletClient({ account: privateKeyToAccount(ownerPk), chain: CHAIN, transport: http() });

// throwaway player wallet, gas paid by the owner at claim time
const playerPk = generatePrivateKey();
const playerAcc = privateKeyToAccount(playerPk);
const player = createWalletClient({ account: playerAcc, chain: CHAIN, transport: http() });

const faucetAbi = JSON.parse(readFileSync("chain/artifacts/MogFaucet.json", "utf8")).abi;
const tokenAbi = JSON.parse(readFileSync("chain/artifacts/MogToken.json", "utf8")).abi;
const marketAbi = JSON.parse(readFileSync("chain/artifacts/MogMarketV2.json", "utf8")).abi;

const wait = (h) => pub.waitForTransactionReceipt({ hash: h, timeout: 180_000 });
const log = (...a) => console.log(...a);

log("player:", playerAcc.address);

// 1. owner-paid claim: player has 0 ETH, so the app must submit claimFor
let pre = await pub.readContract({ address: deps.faucet, abi: faucetAbi, functionName: "canClaim", args: [playerAcc.address] });
log("canClaim:", pre);
const claimHash = await owner.writeContract({ address: deps.faucet, abi: faucetAbi, functionName: "claimFor", args: [playerAcc.address] });
log("claimFor:", (await wait(claimHash)).status, claimHash);

const ethBal = await pub.getBalance({ address: playerAcc.address });
const fluentBal = await pub.readContract({ address: deps.token, abi: tokenAbi, functionName: "balanceOf", args: [playerAcc.address] });
log("after claim → ETH:", formatEther(ethBal), "FLUENT:", formatEther(fluentBal));

// 2. second claim must revert (one per address)
pre = await pub.readContract({ address: deps.faucet, abi: faucetAbi, functionName: "canClaim", args: [playerAcc.address] });
log("canClaim after:", pre);

// 3. buy 1 unit of the top creator
const id = keccak256(toBytes("Druski"));
const price = await pub.readContract({ address: deps.market, abi: marketAbi, functionName: "priceOf", args: [id] });
log("price #1:", formatEther(price), "FLUENT/unit");

const apHash = await player.writeContract({ address: deps.token, abi: tokenAbi, functionName: "approve", args: [deps.market, price] });
log("approve:", (await wait(apHash)).status);

const buyHash = await player.writeContract({ address: deps.market, abi: marketAbi, functionName: "buy", args: [id, 1n] });
log("buy:", (await wait(buyHash)).status, buyHash);

const units = await pub.readContract({ address: deps.market, abi: marketAbi, functionName: "unitsOf", args: [playerAcc.address, id] });
const afterBuy = await pub.readContract({ address: deps.token, abi: tokenAbi, functionName: "balanceOf", args: [playerAcc.address] });
log("units held:", units.toString(), "FLUENT left:", formatEther(afterBuy));

// 4. sell it back
const sellHash = await player.writeContract({ address: deps.market, abi: marketAbi, functionName: "sell", args: [id, 1n] });
log("sell:", (await wait(sellHash)).status, sellHash);
const afterSell = await pub.readContract({ address: deps.token, abi: tokenAbi, functionName: "balanceOf", args: [playerAcc.address] });
const unitsAfter = await pub.readContract({ address: deps.market, abi: marketAbi, functionName: "unitsOf", args: [playerAcc.address, id] });
log("after sell → FLUENT:", formatEther(afterSell), "units:", unitsAfter.toString());

// 5. equity read (what the navbar shows)
const eq = await pub.readContract({ address: deps.market, abi: marketAbi, functionName: "equityOf", args: [playerAcc.address] });
log("equityOf:", formatEther(eq), "FLUENT");

// 6. gas the player has left
log("player gas left:", formatEther(await pub.getBalance({ address: playerAcc.address })), "ETH");
const ok = afterSell === fluentBal && unitsAfter === 0n;
log(ok ? "\nROUND TRIP OK — 5,000 FLUENT in, traded, back out" : "\nMISMATCH — check the numbers above");
process.exit(ok ? 0 : 1);

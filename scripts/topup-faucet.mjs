import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createWalletClient, createPublicClient, http, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
const CHAIN={id:20994,name:"Fluent Testnet",nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},rpcUrls:{default:{http:["https://rpc.testnet.fluent.xyz"]}},testnet:true};
const pk = process.env.FLUENT_DEPLOYER_KEY || JSON.parse(readFileSync(".fluent-deployer.json","utf8")).privateKey;
const account=privateKeyToAccount(pk);
const pub=createPublicClient({chain:CHAIN,transport:http()});
const wallet=createWalletClient({account,chain:CHAIN,transport:http()});
const deps=JSON.parse(readFileSync("chain/deployments.json","utf8"))[20994];
const amt=parseEther(process.argv[2]||"0.01");
const bal=await pub.getBalance({address:account.address});
console.log("deployer",formatEther(bal),"ETH → pool +=",formatEther(amt));
if(bal<amt+parseEther("0.002")){console.error("insufficient");process.exit(2);}
const hash=await wallet.sendTransaction({to:deps.faucet,value:amt});
const rc=await pub.waitForTransactionReceipt({hash,timeout:120000});
const pool=await pub.readContract({address:deps.faucet,abi:[{type:"function",name:"poolBalance",stateMutability:"view",inputs:[],outputs:[{type:"uint256"}]}],functionName:"poolBalance"});
console.log(rc.status,"pool now",formatEther(pool),"ETH →",Math.floor(Number(pool)/5e15),"claims");

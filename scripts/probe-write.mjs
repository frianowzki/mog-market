import { createPublicClient, createWalletClient, http, parseEther, keccak256, toBytes, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "node:fs";
const CHAIN={id:20994,name:"Fluent Testnet",nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},rpcUrls:{default:{http:["https://rpc.testnet.fluent.xyz"]}},testnet:true};
const pub=createPublicClient({chain:CHAIN,transport:http()});
const deps=JSON.parse(readFileSync("chain/deployments.json","utf8"))[20994];
const tokenAbi=JSON.parse(readFileSync("chain/artifacts/MogToken.json","utf8")).abi;
// reuse the funded test player? we don't have its key; use deployer instead (holds 0 FLUENT)
const acct=privateKeyToAccount(JSON.parse(readFileSync(".fluent-deployer.json","utf8")).privateKey);
const w=createWalletClient({account:acct,chain:CHAIN,transport:http()});
const data=encodeFunctionData({abi:tokenAbi,functionName:"approve",args:["0x5ff38d74bab539bffda0bd28fbf940df6a030ca2",1n]});
const nonce=await pub.getTransactionCount({address:acct.address});
console.log("nonce",nonce);
const gp=await pub.getGasPrice();
console.log("gp",gp.toString());
try{
  const est=await pub.estimateGas({account:acct.address,to:deps.token,data});
  console.log("est",est.toString());
}catch(e){console.log("est err",e.shortMessage||e.message);}
try{
  const h=await w.sendTransaction({to:deps.token,data,gas:200000n,maxFeePerGas:gp*2n,maxPriorityFeePerGas:gp});
  console.log("sent",h);
}catch(e){console.log("send err",e.shortMessage||e.message);console.log(JSON.stringify(e.details||"").slice(0,300));}

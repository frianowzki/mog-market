import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
const srv=createServer((_,res)=>{res.setHeader("content-type","text/html;charset=utf-8");res.end(readFileSync("index.html"))}).listen(0);
const b=await chromium.launch({headless:true,executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe"});
const p=await b.newPage({viewport:{width:1440,height:980}});
await p.goto(`http://localhost:${srv.address().port}/`,{waitUntil:"networkidle"});
await p.waitForTimeout(1800);
const d=await p.evaluate(()=>{
  const trs=[...document.querySelectorAll("tr.asset")];
  const pick=[0,19,47,78].map(i=>{const t=trs[i];return {rank:t.querySelector(".rank").textContent,name:t.querySelector(".nm").textContent,chg:t.querySelector(".chg").textContent,cls:t.querySelector(".chg").className,spark:t.querySelector(".spark polyline")?"line":"empty"}});
  const withLine=[...document.querySelectorAll("tr.asset .spark polyline")].length;
  return {pick,withLine,total:trs.length};
});
console.log(JSON.stringify(d,null,1));
await p.screenshot({path:"shot-desktop.png"});
await p.setViewportSize({width:390,height:844});await p.waitForTimeout(400);
await p.screenshot({path:"shot-phone.png"});
await b.close();srv.close();

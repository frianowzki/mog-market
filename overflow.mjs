import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
const srv = createServer((_,res)=>{res.setHeader("content-type","text/html;charset=utf-8");res.end(readFileSync("index.html"))}).listen(0);
const b = await chromium.launch({headless:true,executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe"});
const p = await b.newPage({viewport:{width:390,height:844}});
await p.goto(`http://localhost:${srv.address().port}/`,{waitUntil:"networkidle"});
await p.waitForTimeout(1500);
const w = await p.evaluate(()=>{
  const vw = document.documentElement.clientWidth;
  const bad=[];
  document.querySelectorAll("*").forEach(el=>{
    const r=el.getBoundingClientRect();
    if(r.right>vw+1||r.left<-1) bad.push({tag:el.tagName,cls:el.className?.toString().slice(0,30),right:Math.round(r.right),left:Math.round(r.left),w:Math.round(r.width)});
  });
  return {vw, scrollW:document.documentElement.scrollWidth, bad:bad.slice(0,10)};
});
console.log(JSON.stringify(w,null,1));
await b.close();srv.close();

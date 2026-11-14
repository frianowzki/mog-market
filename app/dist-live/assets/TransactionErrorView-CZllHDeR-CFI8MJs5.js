import{d3 as f,d7 as h,d9 as Ve,e3 as qe,fI as xe,d6 as e,d2 as he,eM as ne,eD as je,gK as ze}from"./index-A6_k7o1J.js";import{L as X,i as Ue,b as Q,h as me,w as Je}from"./ModalFooter-CEqrNWY7-DlsHzfO-.js";import{e as n,t as H,s,n as i,a as _e}from"./Value-DTgR824E-Bj3q6JuJ.js";import{e as B}from"./ErrorMessage-D8VaAP5m-CRVXR1at.js";import{r as O}from"./LabelXs-oqZNqbm_-F3Y9GNY8.js";import{r as ue}from"./Subtitle-CV-2yKE4-C4TjKlrV.js";import{e as pe}from"./Title-BnzYV3Is-mDCexwSQ.js";import{d as c}from"./Address-DDnyjfqr-CEuBugTq.js";import{j as Xe}from"./WalletInfoCard-KURilPiq-87Ur6xx7.js";import{i as ge}from"./LoadingSkeleton-BMsgO5PV-sFZSGMnr.js";import{d as Qe}from"./shared-FM0rljBt-BgT6M5BK.js";import{o as Ze,F as Ge}from"./Checkbox-D1EDeo41-BFB_8dlw.js";import{i as Ye}from"./ErrorBanner-BcpGRt0h-DtdQVQU1.js";import{t as Ke}from"./WarningBanner-ZZqCEtZK-LAE8fLx1.js";import{F as We}from"./ExclamationCircleIcon-DL05JZBv.js";import{F as fe}from"./ChevronDownIcon-brkwBwGR.js";function $e({title:l,titleId:a,...o},m){return f.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:m,"aria-labelledby":a},o),l?f.createElement("title",{id:a},l):null,f.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"}))}const er=f.forwardRef($e);function rr({title:l,titleId:a,...o},m){return f.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:m,"aria-labelledby":a},o),l?f.createElement("title",{id:a},l):null,f.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"}))}const ye=f.forwardRef(rr);function sr({title:l,titleId:a,...o},m){return f.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:m,"aria-labelledby":a},o),l?f.createElement("title",{id:a},l):null,f.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z"}))}const nr=f.forwardRef(sr),ke=h(n)`
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: var(--privy-color-accent);
  svg {
    fill: var(--privy-color-accent);
  }
`;var ie=({iconUrl:l,value:a,symbol:o,usdValue:m,nftName:E,nftCount:p,decimals:t,$isLoading:y})=>{if(y)return e.jsx(te,{$isLoading:y});let k=a&&m&&t?(function(w,I,S){let b=parseFloat(w),x=parseFloat(S);if(b===0||x===0||Number.isNaN(b)||Number.isNaN(x))return w;let g=Math.ceil(-Math.log10(.01/(x/b))),d=Math.pow(10,g=Math.max(g=Math.min(g,I),1)),T=+(Math.floor(b*d)/d).toFixed(g).replace(/\.?0+$/,"");return Intl.NumberFormat(void 0,{maximumFractionDigits:I}).format(T)})(a,t,m):a;return e.jsxs("div",{children:[e.jsxs(te,{$isLoading:y,children:[l&&e.jsx(tr,{src:l,alt:"Token icon"}),p&&p>1?p+"x":void 0," ",E,k," ",o]}),m&&e.jsxs(ir,{$isLoading:y,children:["$",m]})]})};let te=h.span`
  color: var(--privy-color-foreground);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.375rem;
  word-break: break-all;
  text-align: right;
  display: flex;
  justify-content: flex-end;

  /**
   * @NOTE This is a code smell anti-pattern for styling components.
   * We are mixing JSX definitions with styled-components CSS definitions.
   * This is not ideal and should be refactored in the future to separate concerns.
   * This is also hard to read, as it makes it difficult to understand the structure
   * of the component and its styles by viewing the JSX.
   */

  ${ge}
`;const ir=h.span`
  color: var(--privy-color-foreground-2);
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  word-break: break-all;
  text-align: right;
  display: flex;
  justify-content: flex-end;

  ${ge}
`;let tr=h.img`
  height: 14px;
  width: 14px;
  margin-right: 4px;
  object-fit: contain;
`;const or=l=>{var y,k,w,I,S,b,x,g;let{chain:a,transactionDetails:o,isTokenContractInfoLoading:m,symbol:E}=l,{action:p,functionName:t}=o;return e.jsx(Qe,{children:e.jsxs(H,{children:[p!=="transaction"&&e.jsxs(s,{children:[e.jsx(n,{children:"Action"}),e.jsx(i,{children:t})]}),t==="mint"&&"args"in o&&o.args.filter((d=>d)).map(((d,T)=>{var u,C;return e.jsxs(s,{children:[e.jsx(n,{children:`Param ${T}`}),e.jsx(i,{children:typeof d=="string"&&ze(d)?e.jsx(c,{address:d,url:(C=(u=a==null?void 0:a.blockExplorers)==null?void 0:u.default)==null?void 0:C.url,showCopyIcon:!1}):d==null?void 0:d.toString()})]},T)})),t==="setApprovalForAll"&&o.operator&&e.jsxs(s,{children:[e.jsx(n,{children:"Operator"}),e.jsx(i,{children:e.jsx(c,{address:o.operator,url:(k=(y=a==null?void 0:a.blockExplorers)==null?void 0:y.default)==null?void 0:k.url,showCopyIcon:!1})})]}),t==="setApprovalForAll"&&o.approved!==void 0&&e.jsxs(s,{children:[e.jsx(n,{children:"Set approval to"}),e.jsx(i,{children:o.approved?"true":"false"})]}),t==="transfer"||t==="transferWithMemo"||t==="transferFrom"||t==="safeTransferFrom"||t==="approve"?e.jsxs(e.Fragment,{children:["formattedAmount"in o&&o.formattedAmount&&e.jsxs(s,{children:[e.jsx(n,{children:"Amount"}),e.jsxs(i,{$isLoading:m,children:[o.formattedAmount," ",E]})]}),"tokenId"in o&&o.tokenId&&e.jsxs(s,{children:[e.jsx(n,{children:"Token ID"}),e.jsx(i,{children:o.tokenId.toString()})]})]}):null,t==="safeBatchTransferFrom"&&e.jsxs(e.Fragment,{children:["amounts"in o&&o.amounts&&e.jsxs(s,{children:[e.jsx(n,{children:"Amounts"}),e.jsx(i,{children:o.amounts.join(", ")})]}),"tokenIds"in o&&o.tokenIds&&e.jsxs(s,{children:[e.jsx(n,{children:"Token IDs"}),e.jsx(i,{children:o.tokenIds.join(", ")})]})]}),t==="approve"&&o.spender&&e.jsxs(s,{children:[e.jsx(n,{children:"Spender"}),e.jsx(i,{children:e.jsx(c,{address:o.spender,url:(I=(w=a==null?void 0:a.blockExplorers)==null?void 0:w.default)==null?void 0:I.url,showCopyIcon:!1})})]}),(t==="transferFrom"||t==="safeTransferFrom"||t==="safeBatchTransferFrom")&&o.transferFrom&&e.jsxs(s,{children:[e.jsx(n,{children:"Transferring from"}),e.jsx(i,{children:e.jsx(c,{address:o.transferFrom,url:(b=(S=a==null?void 0:a.blockExplorers)==null?void 0:S.default)==null?void 0:b.url,showCopyIcon:!1})})]}),(t==="transferFrom"||t==="safeTransferFrom"||t==="safeBatchTransferFrom")&&o.transferTo&&e.jsxs(s,{children:[e.jsx(n,{children:"Transferring to"}),e.jsx(i,{children:e.jsx(c,{address:o.transferTo,url:(g=(x=a==null?void 0:a.blockExplorers)==null?void 0:x.default)==null?void 0:g.url,showCopyIcon:!1})})]})]})})},ar=({variant:l,setPreventMaliciousTransaction:a,colorScheme:o="light",preventMaliciousTransaction:m})=>l==="warn"?e.jsx(oe,{children:e.jsxs(Ke,{theme:o,children:[e.jsx("span",{style:{fontWeight:"500"},children:"Warning: Suspicious transaction"}),e.jsx("br",{}),"This has been flagged as a potentially deceptive request. Approving could put your assets or funds at risk."]})}):l==="error"?e.jsx(e.Fragment,{children:e.jsxs(oe,{children:[e.jsx(Ye,{theme:o,children:e.jsxs("div",{children:[e.jsx("strong",{children:"This is a malicious transaction"}),e.jsx("br",{}),"This transaction transfers tokens to a known malicious address. Proceeding may result in the loss of valuable assets."]})}),e.jsxs(lr,{children:[e.jsx(Ze,{color:"var(--privy-color-error)",checked:!m,readOnly:!0,onClick:()=>a(!m)}),e.jsx("span",{children:"I understand and want to proceed anyways."})]})]})}):null;let oe=h.div`
  margin-top: 1.5rem;
`,lr=h.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;const dr=({transactionIndex:l,maxIndex:a})=>typeof l!="number"||a===0?"":` (${l+1} / ${a+1})`,Br=({img:l,submitError:a,prepareError:o,onClose:m,action:E,title:p,subtitle:t,to:y,tokenAddress:k,network:w,missingFunds:I,fee:S,from:b,cta:x,disabled:g,chain:d,isSubmitting:T,isPreparing:u,isTokenPriceLoading:C,isTokenContractInfoLoading:A,isSponsored:L,symbol:V,balance:R,onClick:N,transactionDetails:M,transactionIndex:P,maxIndex:q,onBack:r,chainName:v,validation:z,hasScanDetails:Z,setIsScanDetailsOpen:Se,preventMaliciousTransaction:Ce,setPreventMaliciousTransaction:Me,tokensSent:G,tokensReceived:U,isScanning:Fe,isCancellable:Ee,functionName:Oe})=>{var Y,K,W,$,ee,re;let{showTransactionDetails:J,setShowTransactionDetails:Ae,hasMoreDetails:Ne,isErc20Ish:Le}=(j=>{let[D,Pe]=f.useState(!1),_=!0,se=!1;return(!j||j.isErc20Ish||j.action==="transaction")&&(_=!1),_&&(se=Object.entries(j||{}).some((([Be,He])=>He&&!["action","isErc20Ish","isNFTIsh"].includes(Be)))),{showTransactionDetails:D,setShowTransactionDetails:Pe,hasMoreDetails:_&&se,isErc20Ish:j==null?void 0:j.isErc20Ish}})(M),De=he(),Re=Le&&A||u||C||Fe;return e.jsxs(e.Fragment,{children:[e.jsx(X,{onClose:m,backFn:r}),l&&e.jsx(be,{children:l}),e.jsxs(pe,{style:{marginTop:l?"1.5rem":0},children:[p,e.jsx(dr,{maxIndex:q,transactionIndex:P})]}),e.jsx(ue,{children:t}),e.jsxs(H,{style:{marginTop:"2rem"},children:[(!!G[0]||Re)&&e.jsxs(s,{children:[U.length>0?e.jsx(n,{children:"Send"}):e.jsx(n,{children:E==="approve"?"Approval amount":"Amount"}),e.jsx("div",{className:"flex flex-col",children:G.map(((j,D)=>e.jsx(ie,{iconUrl:j.iconUrl,value:Oe==="setApprovalForAll"?"All":j.value,usdValue:j.usdValue,symbol:j.symbol,nftName:j.nftName,nftCount:j.nftCount,decimals:j.decimals},D)))})]}),U.length>0&&e.jsxs(s,{children:[e.jsx(n,{children:"Receive"}),e.jsx("div",{className:"flex flex-col",children:U.map(((j,D)=>e.jsx(ie,{iconUrl:j.iconUrl,value:j.value,usdValue:j.usdValue,symbol:j.symbol,nftName:j.nftName,nftCount:j.nftCount,decimals:j.decimals},D)))})]}),M&&"spender"in M&&(M!=null&&M.spender)?e.jsxs(s,{children:[e.jsx(n,{children:"Spender"}),e.jsx(i,{children:e.jsx(c,{address:M.spender,url:(K=(Y=d==null?void 0:d.blockExplorers)==null?void 0:Y.default)==null?void 0:K.url})})]}):null,y&&e.jsxs(s,{children:[e.jsx(n,{children:"To"}),e.jsx(i,{children:e.jsx(c,{address:y,url:($=(W=d==null?void 0:d.blockExplorers)==null?void 0:W.default)==null?void 0:$.url,showCopyIcon:!0})})]}),k&&e.jsxs(s,{children:[e.jsx(n,{children:"Token address"}),e.jsx(i,{children:e.jsx(c,{address:k,url:(re=(ee=d==null?void 0:d.blockExplorers)==null?void 0:ee.default)==null?void 0:re.url})})]}),e.jsxs(s,{children:[e.jsx(n,{children:"Network"}),e.jsx(i,{children:w})]}),e.jsxs(s,{children:[e.jsx(n,{children:"Estimated fee"}),e.jsx(i,{$isLoading:u||C||L===void 0,children:L?e.jsxs(Te,{children:[e.jsxs(Ie,{children:["Sponsored by ",De.name]}),e.jsx(ye,{height:16,width:16})]}):S})]}),Ne&&!Z&&e.jsxs(e.Fragment,{children:[e.jsx(s,{className:"cursor-pointer",onClick:()=>Ae(!J),children:e.jsxs(_e,{className:"flex items-center gap-x-1",children:["Details"," ",e.jsx(fe,{style:{width:"0.75rem",marginLeft:"0.25rem",transform:J?"rotate(180deg)":void 0}})]})}),J&&M&&e.jsx(or,{action:E,chain:d,transactionDetails:M,isTokenContractInfoLoading:A,symbol:V})]}),Z&&e.jsx(s,{children:e.jsxs(ke,{onClick:()=>Se(!0),children:[e.jsx("span",{className:"text-color-primary",children:"Details"}),e.jsx(er,{height:"14px",width:"14px",strokeWidth:"2"})]})})]}),e.jsx(je,{}),a?e.jsx(B,{style:{marginTop:"2rem"},children:a.message}):o&&P===0?e.jsx(B,{style:{marginTop:"2rem"},children:o.shortMessage??we}):null,e.jsx(ar,{variant:z,preventMaliciousTransaction:Ce,setPreventMaliciousTransaction:Me}),e.jsx(ve,{$useSmallMargins:!(!o&&!a&&z!=="warn"&&z!=="error"),address:b,balance:R,errMsg:u||o||a||!I?void 0:`Add funds on ${(d==null?void 0:d.name)??v} to complete transaction.`}),e.jsx(Q,{style:{marginTop:"1rem"},loading:T,disabled:g||u,onClick:N,children:x}),Ee&&e.jsx(Je,{style:{marginTop:"1rem"},onClick:m,isSubmitting:!1,children:"Not now"}),e.jsx(me,{})]})},Hr=({img:l,title:a,subtitle:o,cta:m,instructions:E,network:p,blockExplorerUrl:t,isMissingFunds:y,submitError:k,parseError:w,total:I,swap:S,transactingWalletAddress:b,fee:x,balance:g,disabled:d,isSubmitting:T,isPreparing:u,isTokenPriceLoading:C,onClick:A,onClose:L,onBack:V,isSponsored:R})=>{let N=u||C,[M,P]=f.useState(!1),q=he();return e.jsxs(e.Fragment,{children:[e.jsx(X,{onClose:L,backFn:V}),l&&e.jsx(be,{children:l}),e.jsx(pe,{style:{marginTop:l?"1.5rem":0},children:a}),e.jsx(ue,{children:o}),e.jsxs(H,{style:{marginTop:"2rem",marginBottom:".5rem"},children:[(I||N)&&e.jsxs(s,{children:[e.jsx(n,{children:"Amount"}),e.jsx(i,{$isLoading:N,children:I})]}),S&&e.jsxs(s,{children:[e.jsx(n,{children:"Swap"}),e.jsx(i,{children:S})]}),p&&e.jsxs(s,{children:[e.jsx(n,{children:"Network"}),e.jsx(i,{children:p})]}),(x||N||R!==void 0)&&e.jsxs(s,{children:[e.jsx(n,{children:"Estimated fee"}),e.jsx(i,{$isLoading:N,children:R&&!N?e.jsxs(Te,{children:[e.jsxs(Ie,{children:["Sponsored by ",q.name]}),e.jsx(ye,{height:16,width:16})]}):x})]})]}),e.jsx(s,{children:e.jsxs(ke,{onClick:()=>P((r=>!r)),children:[e.jsx("span",{children:"Advanced"}),e.jsx(fe,{height:"16px",width:"16px",strokeWidth:"2",style:{transition:"all 300ms",transform:M?"rotate(180deg)":void 0}})]})}),M&&e.jsx(e.Fragment,{children:E.map(((r,v)=>r.type==="sol-transfer"?e.jsxs(F,{children:[e.jsx(s,{children:e.jsxs(O,{children:["Transfer ",r.withSeed?"with seed":""]})}),e.jsxs(s,{children:[e.jsx(n,{children:"Amount"}),e.jsxs(i,{children:[ne({amount:r.value,decimals:r.token.decimals})," ",r.token.symbol]})]}),!!r.toAccount&&e.jsxs(s,{children:[e.jsx(n,{children:"Destination"}),e.jsx(i,{children:e.jsx(c,{address:r.toAccount,url:t})})]})]},v):r.type==="spl-transfer"?e.jsxs(F,{children:[e.jsx(s,{children:e.jsxs(O,{children:["Transfer ",r.token.symbol]})}),e.jsxs(s,{children:[e.jsx(n,{children:"Amount"}),e.jsx(i,{children:r.value.toString()})]}),!!r.fromAta&&e.jsxs(s,{children:[e.jsx(n,{children:"Source"}),e.jsx(i,{children:e.jsx(c,{address:r.fromAta,url:t})})]}),!!r.toAta&&e.jsxs(s,{children:[e.jsx(n,{children:"Destination"}),e.jsx(i,{children:e.jsx(c,{address:r.toAta,url:t})})]}),!!r.token.address&&e.jsxs(s,{children:[e.jsx(n,{children:"Token"}),e.jsx(i,{children:e.jsx(c,{address:r.token.address,url:t})})]})]},v):r.type==="ata-creation"?e.jsxs(F,{children:[e.jsx(s,{children:e.jsx(O,{children:"Create token account"})}),e.jsxs(s,{children:[e.jsx(n,{children:"Program ID"}),e.jsx(i,{children:e.jsx(c,{address:r.program,url:t})})]}),!!r.owner&&e.jsxs(s,{children:[e.jsx(n,{children:"Owner"}),e.jsx(i,{children:e.jsx(c,{address:r.owner,url:t})})]})]},v):r.type==="create-account"?e.jsxs(F,{children:[e.jsx(s,{children:e.jsxs(O,{children:["Create account ",r.withSeed?"with seed":""]})}),!!r.account&&e.jsxs(s,{children:[e.jsx(n,{children:"Account"}),e.jsx(i,{children:e.jsx(c,{address:r.account,url:t})})]}),e.jsxs(s,{children:[e.jsx(n,{children:"Amount"}),e.jsxs(i,{children:[ne({amount:r.value,decimals:9})," SOL"]})]})]},v):r.type==="spl-init-account"?e.jsxs(F,{children:[e.jsx(s,{children:e.jsx(O,{children:"Initialize token account"})}),!!r.account&&e.jsxs(s,{children:[e.jsx(n,{children:"Account"}),e.jsx(i,{children:e.jsx(c,{address:r.account,url:t})})]}),!!r.mint&&e.jsxs(s,{children:[e.jsx(n,{children:"Mint"}),e.jsx(i,{children:e.jsx(c,{address:r.mint,url:t})})]}),!!r.owner&&e.jsxs(s,{children:[e.jsx(n,{children:"Owner"}),e.jsx(i,{children:e.jsx(c,{address:r.owner,url:t})})]})]},v):r.type==="spl-close-account"?e.jsxs(F,{children:[e.jsx(s,{children:e.jsx(O,{children:"Close token account"})}),!!r.source&&e.jsxs(s,{children:[e.jsx(n,{children:"Source"}),e.jsx(i,{children:e.jsx(c,{address:r.source,url:t})})]}),!!r.destination&&e.jsxs(s,{children:[e.jsx(n,{children:"Destination"}),e.jsx(i,{children:e.jsx(c,{address:r.destination,url:t})})]}),!!r.owner&&e.jsxs(s,{children:[e.jsx(n,{children:"Owner"}),e.jsx(i,{children:e.jsx(c,{address:r.owner,url:t})})]})]},v):r.type==="spl-sync-native"?e.jsxs(F,{children:[e.jsx(s,{children:e.jsx(O,{children:"Sync native"})}),e.jsxs(s,{children:[e.jsx(n,{children:"Program ID"}),e.jsx(i,{children:e.jsx(c,{address:r.program,url:t})})]})]},v):r.type==="raydium-swap-base-input"?e.jsxs(F,{children:[e.jsx(s,{children:e.jsxs(O,{children:["Raydium swap"," ",r.tokenIn&&r.tokenOut?`${r.tokenIn.symbol} → ${r.tokenOut.symbol}`:""]})}),e.jsxs(s,{children:[e.jsx(n,{children:"Amount in"}),e.jsx(i,{children:r.amountIn.toString()})]}),e.jsxs(s,{children:[e.jsx(n,{children:"Minimum amount out"}),e.jsx(i,{children:r.minimumAmountOut.toString()})]}),r.mintIn&&e.jsxs(s,{children:[e.jsx(n,{children:"Token in"}),e.jsx(i,{children:e.jsx(c,{address:r.mintIn,url:t})})]}),r.mintOut&&e.jsxs(s,{children:[e.jsx(n,{children:"Token out"}),e.jsx(i,{children:e.jsx(c,{address:r.mintOut,url:t})})]})]},v):r.type==="raydium-swap-base-output"?e.jsxs(F,{children:[e.jsx(s,{children:e.jsxs(O,{children:["Raydium swap"," ",r.tokenIn&&r.tokenOut?`${r.tokenIn.symbol} → ${r.tokenOut.symbol}`:""]})}),e.jsxs(s,{children:[e.jsx(n,{children:"Max amount in"}),e.jsx(i,{children:r.maxAmountIn.toString()})]}),e.jsxs(s,{children:[e.jsx(n,{children:"Amount out"}),e.jsx(i,{children:r.amountOut.toString()})]}),r.mintIn&&e.jsxs(s,{children:[e.jsx(n,{children:"Token in"}),e.jsx(i,{children:e.jsx(c,{address:r.mintIn,url:t})})]}),r.mintOut&&e.jsxs(s,{children:[e.jsx(n,{children:"Token out"}),e.jsx(i,{children:e.jsx(c,{address:r.mintOut,url:t})})]})]},v):r.type==="jupiter-swap-shared-accounts-route"?e.jsxs(F,{children:[e.jsx(s,{children:e.jsxs(O,{children:["Jupiter swap"," ",r.tokenIn&&r.tokenOut?`${r.tokenIn.symbol} → ${r.tokenOut.symbol}`:""]})}),e.jsxs(s,{children:[e.jsx(n,{children:"In amount"}),e.jsx(i,{children:r.inAmount.toString()})]}),e.jsxs(s,{children:[e.jsx(n,{children:"Quoted out amount"}),e.jsx(i,{children:r.quotedOutAmount.toString()})]}),r.mintIn&&e.jsxs(s,{children:[e.jsx(n,{children:"Token in"}),e.jsx(i,{children:e.jsx(c,{address:r.mintIn,url:t})})]}),r.mintOut&&e.jsxs(s,{children:[e.jsx(n,{children:"Token out"}),e.jsx(i,{children:e.jsx(c,{address:r.mintOut,url:t})})]})]},v):r.type==="jupiter-swap-exact-out-route"?e.jsxs(F,{children:[e.jsx(s,{children:e.jsxs(O,{children:["Jupiter swap"," ",r.tokenIn&&r.tokenOut?`${r.tokenIn.symbol} → ${r.tokenOut.symbol}`:""]})}),e.jsxs(s,{children:[e.jsx(n,{children:"Quoted in amount"}),e.jsx(i,{children:r.quotedInAmount.toString()})]}),e.jsxs(s,{children:[e.jsx(n,{children:"Amount out"}),e.jsx(i,{children:r.outAmount.toString()})]}),r.mintIn&&e.jsxs(s,{children:[e.jsx(n,{children:"Token in"}),e.jsx(i,{children:e.jsx(c,{address:r.mintIn,url:t})})]}),r.mintOut&&e.jsxs(s,{children:[e.jsx(n,{children:"Token out"}),e.jsx(i,{children:e.jsx(c,{address:r.mintOut,url:t})})]})]},v):e.jsxs(F,{children:[e.jsxs(s,{children:[e.jsx(n,{children:"Program ID"}),e.jsx(i,{children:e.jsx(c,{address:r.program,url:t})})]}),e.jsxs(s,{children:[e.jsx(n,{children:"Data"}),e.jsx(i,{children:r.discriminator})]})]},v)))}),e.jsx(je,{}),k?e.jsx(B,{style:{marginTop:"2rem"},children:k.message}):w?e.jsx(B,{style:{marginTop:"2rem"},children:we}):null,e.jsx(ve,{$useSmallMargins:!(!w&&!k),title:"",address:b,balance:g,errMsg:u||w||k||!y?void 0:"Add funds on Solana to complete transaction."}),e.jsx(Q,{style:{marginTop:"1rem"},loading:T,disabled:d||u,onClick:A,children:m}),e.jsx(me,{})]})};let ve=h(Xe)`
  ${l=>l.$useSmallMargins?"margin-top: 0.5rem;":"margin-top: 2rem;"}
`,F=h(H)`
  margin-top: 0.5rem;
  border: 1px solid var(--privy-color-foreground-4);
  border-radius: var(--privy-border-radius-sm);
  padding: 0.5rem;
`,we="There was an error preparing your transaction. Your transaction request will likely fail.",be=h.div`
  display: flex;
  width: 100%;
  justify-content: center;
  max-height: 40px;

  > img {
    object-fit: contain;
    border-radius: var(--privy-border-radius-sm);
  }
`,Te=h.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
`,Ie=h.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--privy-color-foreground);
`,ae=l=>(l==null?void 0:l.code)===xe.COMPLIANCE_BLOCKED,cr=()=>e.jsxs(mr,{children:[e.jsx(pr,{}),e.jsx(ur,{})]});const Vr=({transactionError:l,chainId:a,onClose:o,onRetry:m,chainType:E,transactionHash:p})=>{let{chains:t}=Ve(),[y,k]=f.useState(!1),{errorCode:w,errorMessage:I}=((x,g)=>{if(x instanceof qe&&x.code===xe.MISSING_MFA_ENROLLMENT)return{errorCode:"MFA enrollment required",errorMessage:x.message};if(g==="ethereum")return ae(x)?{errorCode:"Transaction blocked",errorMessage:x.message}:{errorCode:x.details??x.message,errorMessage:x.shortMessage};let d=x.txSignature,T=(x==null?void 0:x.transactionMessage)||"Something went wrong.";if(Array.isArray(x.logs)){let u=x.logs.find((C=>/insufficient (lamports|funds)/gi.test(C)));u&&(T=u)}return{transactionHash:d,errorMessage:T}})(l,E),S=ae(l),b=(({chains:x,chainId:g,chainType:d,transactionHash:T})=>{var u,C;return d==="ethereum"?((C=(u=x.find((A=>A.id===g)))==null?void 0:u.blockExplorers)==null?void 0:C.default.url)??"https://etherscan.io":(function(A,L){return`https://explorer.solana.com/tx/${A}?chain=${L}`})(T||"",g)})({chains:t,chainId:a,chainType:E,transactionHash:p});return e.jsxs(e.Fragment,{children:[e.jsx(X,{onClose:o}),e.jsxs(xr,{children:[e.jsx(cr,{}),e.jsx(hr,{children:w}),e.jsx(jr,{children:S?"This transaction cannot be completed.":"Please try again."}),e.jsxs(de,{children:[e.jsx(le,{children:"Error message"}),e.jsx(ce,{$clickable:!1,children:I})]}),p&&e.jsxs(de,{children:[e.jsx(le,{children:"Transaction hash"}),e.jsxs(fr,{children:["Copy this hash to view details about the transaction on a"," ",e.jsx("u",{children:e.jsx("a",{href:b,children:"block explorer"})}),"."]}),e.jsxs(ce,{$clickable:!0,onClick:async()=>{await navigator.clipboard.writeText(p),k(!0)},children:[p,e.jsx(vr,{clicked:y})]})]}),!S&&e.jsx(gr,{onClick:()=>m({resetNonce:!!p}),children:"Retry transaction"})]}),e.jsx(Ue,{})]})};let xr=h.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`,hr=h.span`
  color: var(--privy-color-foreground);
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.25rem; /* 111.111% */
  text-align: center;
  margin: 10px;
`,jr=h.span`
  margin-top: 4px;
  margin-bottom: 10px;
  color: var(--privy-color-foreground-3);
  text-align: center;

  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 142.857% */
  letter-spacing: -0.008px;
`,mr=h.div`
  position: relative;
  width: 60px;
  height: 60px;
  margin: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`,ur=h(We)`
  position: absolute;
  width: 35px;
  height: 35px;
  color: var(--privy-color-error);
`,pr=h.div`
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--privy-color-error);
  opacity: 0.1;
`,gr=h(Q)`
  && {
    margin-top: 24px;
  }
  transition:
    color 350ms ease,
    background-color 350ms ease;
`,le=h.span`
  width: 100%;
  text-align: left;
  font-size: 0.825rem;
  color: var(--privy-color-foreground);
  padding: 4px;
`,de=h.div`
  width: 100%;
  margin: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`,fr=h.text`
  position: relative;
  width: 100%;
  padding: 5px;
  font-size: 0.8rem;
  color: var(--privy-color-foreground-3);
  text-align: left;
  overflow-wrap: break-word;
`,ce=h.span`
  position: relative;
  width: 100%;
  background-color: var(--privy-color-background-2);
  padding: 8px 12px;
  border-radius: 10px;
  margin-top: 5px;
  font-size: 14px;
  color: var(--privy-color-foreground-3);
  text-align: left;
  overflow-wrap: break-word;
  ${l=>l.$clickable&&`cursor: pointer;
  transition: background-color 0.3s;
  padding-right: 45px;

  &:hover {
    background-color: var(--privy-color-foreground-4);
  }`}
`,yr=h(nr)`
  position: absolute;
  top: 13px;
  right: 13px;
  width: 24px;
  height: 24px;
`,kr=h(Ge)`
  position: absolute;
  top: 13px;
  right: 13px;
  width: 24px;
  height: 24px;
`,vr=({clicked:l})=>e.jsx(l?kr:yr,{});export{Br as G,Hr as Q,Vr as t};

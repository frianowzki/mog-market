import{dH as Y,d1 as G,d2 as Z,d9 as ee,d3 as l,dc as u,dP as re,dD as F,d6 as t,dF as $,dA as te,d7 as s}from"./index-A6_k7o1J.js";import{n as ae}from"./OpenLink-CUpJ1mOr-C9ud8cPO.js";import{$ as oe}from"./QrCode-BPg5-1Xn-BUNPJg0U.js";import{f as ie}from"./ModalFooter-CEqrNWY7-DlsHzfO-.js";import{r as se}from"./LabelXs-oqZNqbm_-F3Y9GNY8.js";import{a as ne}from"./shouldProceedtoEmbeddedWalletCreationFlow-BhRtNzxm-C5Fd0yz3.js";import{n as le}from"./ScreenLayout-D73wYqNX-q_Oloqqd.js";import{l as O}from"./farcaster-DPlSjvF5-Cn2XECYa.js";import{C as ce}from"./check-DinxiXFI.js";import{C as de}from"./copy-DoC5TiQs.js";import"./dijkstra-COg3n3zL.js";import"./Screen-C7bUGqXu-DWykNzqZ.js";import"./index-CWARkn2w-DHM8Z4Ob.js";import"./createLucideIcon-604B8ye0.js";let ue=s.div`
  width: 100%;
`,pe=s.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem;
  height: 56px;
  background: ${r=>r.$disabled?"var(--privy-color-background-2)":"var(--privy-color-background)"};
  border: 1px solid var(--privy-color-foreground-4);
  border-radius: var(--privy-border-radius-md);

  &:hover {
    border-color: ${r=>r.$disabled?"var(--privy-color-foreground-4)":"var(--privy-color-foreground-3)"};
  }
`,me=s.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
`,Q=s.span`
  display: block;
  font-size: 16px;
  line-height: 24px;
  color: ${r=>r.$disabled?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* Single-line truncation: as a flex item this would otherwise be floored at its
     min-content width, so min-width: 0 lets it shrink and the ellipsis land at the
     container edge. */
  min-width: 0;

  @media (min-width: 441px) {
    font-size: 14px;
    line-height: 20px;
  }
`,he=s(Q)`
  color: var(--privy-color-foreground-3);
  font-style: italic;
`,fe=s(se)`
  margin-bottom: 0.5rem;
`,ge=s(ie)`
  && {
    gap: 0.375rem;
    font-size: 14px;
    flex-shrink: 0;
  }
`;const ve=({value:r,title:p,placeholder:c,className:a,showCopyButton:d=!0,truncate:i,maxLength:m=40,disabled:h=!1})=>{let[n,x]=l.useState(!1),w=i&&r?((o,E,f)=>{if((o=o.startsWith("https://")?o.slice(8):o).length<=f)return o;if(E==="middle"){let y=Math.ceil(f/2)-2,C=Math.floor(f/2)-1;return`${o.slice(0,y)}...${o.slice(-C)}`}return`${o.slice(0,f-3)}...`})(r,i,m):r;return l.useEffect((()=>{if(n){let o=setTimeout((()=>x(!1)),3e3);return()=>clearTimeout(o)}}),[n]),t.jsxs(ue,{className:a,children:[p&&t.jsx(fe,{children:p}),t.jsxs(pe,{$disabled:h,children:[t.jsx(me,{children:r?t.jsx(Q,{$disabled:h,title:r,children:w}):t.jsx(he,{$disabled:h,children:c||"No value"})}),d&&r&&t.jsx(ge,{onClick:function(o){o.stopPropagation(),navigator.clipboard.writeText(r).then((()=>x(!0))).catch(console.error)},size:"sm",children:t.jsxs(t.Fragment,n?{children:["Copied",t.jsx(ce,{size:14})]}:{children:["Copy",t.jsx(de,{size:14})]})})]})]})},xe=({connectUri:r,loading:p,success:c,errorMessage:a,onBack:d,onClose:i,onOpenFarcaster:m})=>t.jsx(le,$.isMobile||p?$.isIOS?{title:a?a.message:"Sign in with Farcaster",subtitle:a?a.detail:"To sign in with Farcaster, please open the Farcaster app.",icon:O,iconVariant:"loading",iconLoadingStatus:{success:c,fail:!!a},primaryCta:r&&m?{label:"Open Farcaster app",onClick:m}:void 0,onBack:d,onClose:i,watermark:!0}:{title:a?a.message:"Signing in with Farcaster",subtitle:a?a.detail:"This should only take a moment",icon:O,iconVariant:"loading",iconLoadingStatus:{success:c,fail:!!a},onBack:d,onClose:i,watermark:!0,children:r&&$.isMobile&&t.jsx(ye,{children:t.jsx(ae,{text:"Take me to Farcaster",url:r,color:"#8a63d2"})})}:{title:"Sign in with Farcaster",subtitle:"Scan with your phone's camera to continue.",onBack:d,onClose:i,watermark:!0,children:t.jsxs(be,{children:[t.jsx(Se,{children:r?t.jsx(oe,{url:r,size:275,squareLogoElement:O}):t.jsx(Ce,{children:t.jsx(te,{})})}),t.jsxs(we,{children:[t.jsx(Ee,{children:"Or copy this link and paste it into a phone browser to open the Farcaster app."}),r&&t.jsx(ve,{value:r,truncate:"end",maxLength:30,showCopyButton:!0,disabled:!0})]})]})}),Me={component:()=>{let{authenticated:r,logout:p,ready:c,user:a}=Y(),{lastScreen:d,navigate:i,navigateBack:m,setModalData:h}=G(),n=Z(),{getAuthFlow:x,loginWithFarcaster:w,closePrivyModal:o,createAnalyticsEvent:E}=ee(),[f,y]=l.useState(void 0),[C,J]=l.useState(!1),[b,K]=l.useState(!1),T=l.useRef([]),S=x(),A=S==null?void 0:S.meta.connectUri;return l.useEffect((()=>{let g=Date.now(),j=setInterval((async()=>{var _,R,L,N,I,U,D,M,B,W,z,V,q,P,H;let k=await S.pollForReady.execute(),X=Date.now()-g;if(k){clearInterval(j),J(!0);try{await w(),K(!0)}catch(e){let v={retryable:!1,message:"Authentication failed"};if((e==null?void 0:e.privyErrorCode)===u.ALLOWLIST_REJECTED)return void i("AllowlistRejectionScreen");if((e==null?void 0:e.privyErrorCode)===u.USER_LIMIT_REACHED)return console.error(new re(e).toString()),void i("UserLimitReachedScreen");if((e==null?void 0:e.privyErrorCode)===u.USER_DOES_NOT_EXIST)return void i("AccountNotFoundScreen");if((e==null?void 0:e.privyErrorCode)===u.LINKED_TO_ANOTHER_USER)v.detail=e.message??"This account has already been linked to another user.";else{if((e==null?void 0:e.privyErrorCode)===u.ACCOUNT_TRANSFER_REQUIRED&&((R=(_=e.data)==null?void 0:_.data)!=null&&R.nonce))return h({accountTransfer:{nonce:(N=(L=e.data)==null?void 0:L.data)==null?void 0:N.nonce,account:(U=(I=e.data)==null?void 0:I.data)==null?void 0:U.subject,displayName:(B=(M=(D=e.data)==null?void 0:D.data)==null?void 0:M.account)==null?void 0:B.displayName,linkMethod:"farcaster",embeddedWalletAddress:(V=(z=(W=e.data)==null?void 0:W.data)==null?void 0:z.otherUser)==null?void 0:V.embeddedWalletAddress,farcasterEmbeddedAddress:(H=(P=(q=e.data)==null?void 0:q.data)==null?void 0:P.otherUser)==null?void 0:H.farcasterEmbeddedAddress}}),void i("LinkConflictScreen");(e==null?void 0:e.privyErrorCode)===u.INVALID_CREDENTIALS?(v.retryable=!0,v.detail="Something went wrong. Try again."):(e==null?void 0:e.privyErrorCode)===u.TOO_MANY_REQUESTS&&(v.detail="Too many requests. Please wait before trying again.")}y(v)}}else X>12e4&&(clearInterval(j),y({retryable:!0,message:"Authentication failed",detail:"The request timed out. Try again."}))}),2e3);return()=>{clearInterval(j),T.current.forEach((k=>clearTimeout(k)))}}),[]),l.useEffect((()=>{if(c&&r&&b&&a){if(n!=null&&n.legal.requireUsersAcceptTerms&&!a.hasAcceptedTerms){let g=setTimeout((()=>{i("AffirmativeConsentScreen")}),F);return()=>clearTimeout(g)}b&&(ne(a,n.embeddedWallets)?T.current.push(setTimeout((()=>{h({createWallet:{onSuccess:()=>{},onFailure:g=>{console.error(g),E({eventName:"embedded_wallet_creation_failure_logout",payload:{error:g,screen:"FarcasterConnectStatusScreen"}}),p()},callAuthOnSuccessOnClose:!0}}),i("EmbeddedWalletOnAccountCreateScreen")}),F)):T.current.push(setTimeout((()=>o({shouldCallAuthOnSuccess:!0,isSuccess:!0})),F)))}}),[b,c,r,a]),t.jsx(xe,{connectUri:A,loading:C,success:b,errorMessage:f,onBack:d?m:void 0,onClose:o,onOpenFarcaster:()=>{A&&(window.location.href=A)}})}};let ye=s.div`
  margin-top: 24px;
`,be=s.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`,Se=s.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 275px;
`,we=s.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`,Ee=s.div`
  font-size: 0.875rem;
  text-align: center;
  color: var(--privy-color-foreground-2);
`,Ce=s.div`
  position: relative;
  width: 82px;
  height: 82px;
`;export{Me as FarcasterConnectStatusScreen,xe as FarcasterConnectStatusView,Me as default};

import{d1 as T,d2 as I,d9 as C,d3 as d,dD as y,d6 as a,dF as h,dA as O,d7 as n}from"./index-A6_k7o1J.js";import{h as q}from"./CopyToClipboard-i_OQSBJr-BBUn_eiY.js";import{n as B}from"./OpenLink-CUpJ1mOr-C9ud8cPO.js";import{$ as E}from"./QrCode-BPg5-1Xn-BUNPJg0U.js";import{n as A}from"./ScreenLayout-D73wYqNX-q_Oloqqd.js";import{l as x}from"./farcaster-DPlSjvF5-Cn2XECYa.js";import"./dijkstra-COg3n3zL.js";import"./ModalFooter-CEqrNWY7-DlsHzfO-.js";import"./Screen-C7bUGqXu-DWykNzqZ.js";import"./index-CWARkn2w-DHM8Z4Ob.js";let S="#8a63d2";const M=({appName:u,loading:m,success:i,errorMessage:e,connectUri:r,onBack:s,onClose:c,onOpenFarcaster:o})=>a.jsx(A,h.isMobile||m?h.isIOS?{title:e?e.message:"Add a signer to Farcaster",subtitle:e?e.detail:`This will allow ${u} to add casts, likes, follows, and more on your behalf.`,icon:x,iconVariant:"loading",iconLoadingStatus:{success:i,fail:!!e},primaryCta:r&&o?{label:"Open Farcaster app",onClick:o}:void 0,onBack:s,onClose:c,watermark:!0}:{title:e?e.message:"Requesting signer from Farcaster",subtitle:e?e.detail:"This should only take a moment",icon:x,iconVariant:"loading",iconLoadingStatus:{success:i,fail:!!e},onBack:s,onClose:c,watermark:!0,children:r&&h.isMobile&&a.jsx(_,{children:a.jsx(B,{text:"Take me to Farcaster",url:r,color:S})})}:{title:"Add a signer to Farcaster",subtitle:`This will allow ${u} to add casts, likes, follows, and more on your behalf.`,onBack:s,onClose:c,watermark:!0,children:a.jsxs(L,{children:[a.jsx(R,{children:r?a.jsx(E,{url:r,size:275,squareLogoElement:x}):a.jsx(N,{children:a.jsx(O,{})})}),a.jsxs(V,{children:[a.jsx(D,{children:"Or copy this link and paste it into a phone browser to open the Farcaster app."}),r&&a.jsx(q,{text:r,itemName:"link",color:S})]})]})});let _=n.div`
  margin-top: 24px;
`,L=n.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`,R=n.div`
  padding: 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 275px;
`,V=n.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`,D=n.div`
  font-size: 0.875rem;
  text-align: center;
  color: var(--privy-color-foreground-2);
`,N=n.div`
  position: relative;
  width: 82px;
  height: 82px;
`;const Y={component:()=>{let{lastScreen:u,navigateBack:m,data:i}=T(),e=I(),{requestFarcasterSignerStatus:r,closePrivyModal:s}=C(),[c,o]=d.useState(void 0),[k,v]=d.useState(!1),[b,w]=d.useState(!1),g=d.useRef([]),t=i==null?void 0:i.farcasterSigner;d.useEffect((()=>{let j=Date.now(),l=setInterval((async()=>{if(!(t!=null&&t.public_key))return clearInterval(l),void o({retryable:!0,message:"Connect failed",detail:"Something went wrong. Please try again."});t.status==="approved"&&(clearInterval(l),v(!1),w(!0),g.current.push(setTimeout((()=>s({shouldCallAuthOnSuccess:!1,isSuccess:!0})),y)));let p=await r(t==null?void 0:t.public_key),F=Date.now()-j;p.status==="approved"?(clearInterval(l),v(!1),w(!0),g.current.push(setTimeout((()=>s({shouldCallAuthOnSuccess:!1,isSuccess:!0})),y))):F>3e5?(clearInterval(l),o({retryable:!0,message:"Connect failed",detail:"The request timed out. Try again."})):p.status==="revoked"&&(clearInterval(l),o({retryable:!0,message:"Request rejected",detail:"The request was rejected. Please try again."}))}),2e3);return()=>{clearInterval(l),g.current.forEach((p=>clearTimeout(p)))}}),[]);let f=(t==null?void 0:t.status)==="pending_approval"?t.signer_approval_url:void 0;return a.jsx(M,{appName:e.name,loading:k,success:b,errorMessage:c,connectUri:f,onBack:u?m:void 0,onClose:s,onOpenFarcaster:()=>{f&&(window.location.href=f)}})}};export{Y as FarcasterSignerStatusScreen,M as FarcasterSignerStatusView,Y as default};

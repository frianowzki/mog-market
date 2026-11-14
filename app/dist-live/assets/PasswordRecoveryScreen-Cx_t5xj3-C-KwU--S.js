import{d3 as a,dH as _,d9 as E,d1 as I,d6 as e,eR as $,eS as F,eg as O,d7 as p,ep as U}from"./index-A6_k7o1J.js";import{F as W}from"./ShieldCheckIcon-DOTdbvJZ.js";import{b as H}from"./ModalFooter-CEqrNWY7-DlsHzfO-.js";import{l as N}from"./Layouts-CaU-iybi-BeSrCZrM.js";import{g as V,h as z,y as q,w as B,k as D}from"./shared-DmlxgMuJ-95UxEXgN.js";import{w as s}from"./Screen-C7bUGqXu-DWykNzqZ.js";import"./index-CWARkn2w-DHM8Z4Ob.js";const re={component:()=>{let[o,y]=a.useState(!0),{authenticated:m,user:j}=_(),{walletProxy:i,closePrivyModal:v,createAnalyticsEvent:x,client:b}=E(),{navigate:k,data:A,onUserCloseViaDialogOrKeybindRef:C}=I(),[n,S]=a.useState(void 0),[f,d]=a.useState(""),[c,w]=a.useState(!1),{entropyId:u,entropyIdVerifier:P,onCompleteNavigateTo:g,onSuccess:h,onFailure:R}=A.recoverWallet,l=(r="User exited before their wallet could be recovered")=>{v({shouldCallAuthOnSuccess:!1}),R(typeof r=="string"?new O(r):r)};return C.current=l,a.useEffect((()=>{if(!m)return l("User must be authenticated and have a Privy wallet before it can be recovered")}),[m]),e.jsxs(s,{children:[e.jsx(s.Header,{icon:W,title:"Enter your password",subtitle:"Please provision your account on this new device. To continue, enter your recovery password.",showClose:!0,onClose:l}),e.jsx(s.Body,{children:e.jsx(K,{children:e.jsxs("div",{children:[e.jsxs(V,{children:[e.jsx(z,{type:o?"password":"text",onChange:r=>(t=>{t&&S(t)})(r.target.value),disabled:c,style:{paddingRight:"2.3rem"}}),e.jsx(q,{style:{right:"0.75rem"},children:o?e.jsx(B,{onClick:()=>y(!1)}):e.jsx(D,{onClick:()=>y(!0)})})]}),!!f&&e.jsx(L,{children:f})]})})}),e.jsxs(s.Footer,{children:[e.jsx(s.HelpText,{children:e.jsxs(N,{children:[e.jsx("h4",{children:"Why is this necessary?"}),e.jsx("p",{children:"You previously set a password for this wallet. This helps ensure only you can access it"})]})}),e.jsx(s.Actions,{children:e.jsx(M,{loading:c||!i,disabled:!n,onClick:async()=>{w(!0);let r=await b.getAccessToken(),t=$(j,u);if(!r||!t||n===null)return l("User must be authenticated and have a Privy wallet before it can be recovered");try{x({eventName:"embedded_wallet_recovery_started",payload:{walletAddress:t.address}}),await(i==null?void 0:i.recover({accessToken:r,entropyId:u,entropyIdVerifier:P,recoveryPassword:n})),d(""),g?k(g):v({shouldCallAuthOnSuccess:!1}),h==null||h(t),x({eventName:"embedded_wallet_recovery_completed",payload:{walletAddress:t.address}})}catch(T){F(T)?d("Invalid recovery password, please try again."):d("An error has occurred, please try again.")}finally{w(!1)}},$hideAnimations:!u&&c,children:"Recover your account"})}),e.jsx(s.Watermark,{})]})]})}};let K=p.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`,L=p.div`
  line-height: 20px;
  height: 20px;
  font-size: 13px;
  color: var(--privy-color-error);
  text-align: left;
  margin-top: 0.5rem;
`,M=p(H)`
  ${({$hideAnimations:o})=>o&&U`
      && {
        /* Remove animations because the recoverWallet task on the iframe partially
           blocks the renderer, so the animation stutters and doesn't look good */
        transition: none;
      }
    `}
`;export{re as PasswordRecoveryScreen,re as default};

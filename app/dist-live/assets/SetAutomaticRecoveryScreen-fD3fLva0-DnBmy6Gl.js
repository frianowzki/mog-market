import{dH as k,d9 as I,d1 as M,d3 as u,d6 as e,eD as v,eR as j,dD as P,d7 as W}from"./index-A6_k7o1J.js";import{F as A}from"./ExclamationTriangleIcon-edJyUybL.js";import{F as V}from"./LockClosedIcon-Dx8AdI9a.js";import{L as S,u as b,h as R}from"./ModalFooter-CEqrNWY7-DlsHzfO-.js";import{r as D}from"./Subtitle-CV-2yKE4-C4TjKlrV.js";import{e as T}from"./Title-BnzYV3Is-mDCexwSQ.js";const H=W.div`
  && {
    border-width: 4px;
  }

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  aspect-ratio: 1;
  border-style: solid;
  border-color: ${l=>l.$color??"var(--privy-color-accent)"};
  border-radius: 50%;
`,B={component:()=>{var g;let{user:l}=k(),{client:C,walletProxy:m,refreshSessionAndUser:E,closePrivyModal:i}=I(),s=M(),{entropyId:f,entropyIdVerifier:F}=((g=s.data)==null?void 0:g.recoverWallet)??{},[n,h]=u.useState(!1),[c,U]=u.useState(null),[d,p]=u.useState(null);function y(){var r,o,t,a;if(!n){if(d)return(o=(r=s.data)==null?void 0:r.setWalletPassword)==null||o.onFailure(d),void i();if(!c)return(a=(t=s.data)==null?void 0:t.setWalletPassword)==null||a.onFailure(Error("User exited set recovery flow")),void i()}}s.onUserCloseViaDialogOrKeybindRef.current=y;let $=!(!n&&!c);return e.jsxs(e.Fragment,d?{children:[e.jsx(S,{onClose:y},"header"),e.jsx(H,{$color:"var(--privy-color-error)",style:{alignSelf:"center"},children:e.jsx(A,{height:38,width:38,stroke:"var(--privy-color-error)"})}),e.jsx(T,{style:{marginTop:"0.5rem"},children:"Something went wrong"}),e.jsx(v,{style:{minHeight:"2rem"}}),e.jsx(b,{onClick:()=>p(null),children:"Try again"}),e.jsx(R,{})]}:{children:[e.jsx(S,{onClose:y},"header"),e.jsx(V,{style:{width:"3rem",height:"3rem",alignSelf:"center"}}),e.jsx(T,{style:{marginTop:"0.5rem"},children:"Automatically secure your account"}),e.jsx(D,{style:{marginTop:"1rem"},children:"When you log into a new device, you’ll only need to authenticate to access your account. Never get logged out if you forget your password."}),e.jsx(v,{style:{minHeight:"2rem"}}),e.jsx(b,{loading:n,disabled:$,onClick:()=>(async function(){h(!0);try{let r=await C.getAccessToken(),o=j(l,f);if(!r||!m||!o)return;if(!(await m.setRecovery({accessToken:r,entropyId:f,entropyIdVerifier:F,existingRecoveryMethod:o.recoveryMethod,recoveryMethod:"privy"})).entropyId)throw Error("Unable to set recovery on wallet");let t=await E();if(!t)throw Error("Unable to set recovery on wallet");let a=j(t,o.address);if(!a)throw Error("Unabled to set recovery on wallet");U(!!t),setTimeout((()=>{var w,x;(x=(w=s.data)==null?void 0:w.setWalletPassword)==null||x.onSuccess(a),i()}),P)}catch(r){p(r)}finally{h(!1)}})(),children:c?"Success":"Confirm"}),e.jsx(R,{})]})}};export{B as SetAutomaticRecoveryScreen,B as default};

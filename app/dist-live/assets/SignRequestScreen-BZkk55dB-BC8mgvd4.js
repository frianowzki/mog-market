import{dH as U,d9 as A,d1 as k,d3 as o,fH as I,dM as E,f4 as C,f5 as T,d6 as a,dD as z,e3 as F,fI as q,d7 as u,dQ as P,fJ as H,fK as V}from"./index-A6_k7o1J.js";import{h as J}from"./CopyToClipboard-i_OQSBJr-BBUn_eiY.js";import{d as K}from"./Layouts-CaU-iybi-BeSrCZrM.js";import{a as Q,i as $}from"./JsonTree-BHzNC-ic-CwSlM00h.js";import{n as G}from"./ScreenLayout-D73wYqNX-q_Oloqqd.js";import{c as W}from"./createLucideIcon-604B8ye0.js";import"./ModalFooter-CEqrNWY7-DlsHzfO-.js";import"./Screen-C7bUGqXu-DWykNzqZ.js";import"./index-CWARkn2w-DHM8Z4Ob.js";/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]],X=W("square-pen",B),Y=u.img`
  && {
    height: ${e=>e.size==="sm"?"65px":"140px"};
    width: ${e=>e.size==="sm"?"65px":"140px"};
    border-radius: 16px;
    margin-bottom: 12px;
  }
`;let Z=e=>{if(!P(e))return e;try{let n=H(e);return n.includes("�")?e:n}catch{return e}},O=e=>{try{let n=V.decode(e),i=new TextDecoder().decode(n);return i.includes("�")?e:i}catch{return e}},ee=e=>{let{types:n,primaryType:i,...l}=e.typedData;return a.jsxs(a.Fragment,{children:[a.jsx(ne,{data:l}),a.jsx(J,{text:(r=e.typedData,JSON.stringify(r,null,2)),itemName:"full payload to clipboard"})," "]});var r};const te=({method:e,messageData:n,copy:i,iconUrl:l,isLoading:r,success:p,walletProxyIsLoading:g,errorMessage:m,isCancellable:x,onSign:c,onCancel:f,onClose:d})=>a.jsx(G,{title:i.title,subtitle:i.description,showClose:!0,onClose:d,icon:X,iconVariant:"subtle",helpText:m?a.jsx(se,{children:m}):void 0,primaryCta:{label:i.buttonText,onClick:c,disabled:r||p||g,loading:r},secondaryCta:x?{label:"Not now",onClick:f,disabled:r||p||g}:void 0,watermark:!0,children:a.jsxs(K,{children:[l?a.jsx(Y,{style:{alignSelf:"center"},size:"sm",src:l,alt:"app image"}):null,a.jsxs(ae,{children:[e==="personal_sign"&&a.jsx(w,{children:Z(n)}),e==="eth_signTypedData_v4"&&a.jsx(ee,{typedData:n}),e==="solana_signMessage"&&a.jsx(w,{children:O(n)})]})]})}),me={component:()=>{let{authenticated:e}=U(),{initializeWalletProxy:n,closePrivyModal:i}=A(),{navigate:l,data:r,onUserCloseViaDialogOrKeybindRef:p}=k(),[g,m]=o.useState(!0),[x,c]=o.useState(""),[f,d]=o.useState(),[y,_]=o.useState(null),[R,S]=o.useState(!1);o.useEffect((()=>{e||l("LandingScreen")}),[e]),o.useEffect((()=>{n(I).then((s=>{m(!1),s||(c("An error has occurred, please try again."),d(new E(new C(x,T.E32603_DEFAULT_INTERNAL_ERROR.eipCode))))}))}),[]);let{method:j,data:v,confirmAndSign:D,onSuccess:L,onFailure:M,uiOptions:t}=r.signMessage,N={title:(t==null?void 0:t.title)||"Sign message",description:(t==null?void 0:t.description)||"Signing this message will not cost you any fees.",buttonText:(t==null?void 0:t.buttonText)||"Sign and continue"},h=s=>{s?L(s):M(f||new E(new C("The user rejected the request.",T.E4001_USER_REJECTED_REQUEST.eipCode))),i({shouldCallAuthOnSuccess:!1}),setTimeout((()=>{_(null),c(""),d(void 0)}),200)};return p.current=()=>{h(y)},a.jsx(te,{method:j,messageData:v,copy:N,iconUrl:t!=null&&t.iconUrl&&typeof t.iconUrl=="string"?t.iconUrl:void 0,isLoading:R,success:y!==null,walletProxyIsLoading:g,errorMessage:x,isCancellable:t==null?void 0:t.isCancellable,onSign:async()=>{S(!0),c("");try{let s=await D();_(s),S(!1),setTimeout((()=>{h(s)}),z)}catch(s){console.error(s);let b=s instanceof F&&s.code===q.MISSING_MFA_ENROLLMENT?s.message:"An error has occurred, please try again.";c(b),d(new E(new C(b,T.E32603_DEFAULT_INTERNAL_ERROR.eipCode))),S(!1)}},onCancel:()=>h(null),onClose:()=>h(y)})}};let ae=u.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`,se=u.p`
  && {
    margin: 0;
    width: 100%;
    text-align: center;
    color: var(--privy-color-error-dark);
    font-size: 14px;
    line-height: 22px;
  }
`,ne=u(Q)`
  margin-top: 0;
`,w=u($)`
  margin-top: 0;
`;export{me as SignRequestScreen,te as SignRequestView,me as default};

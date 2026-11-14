import{dH as P,d1 as z,d3 as y,fB as R,d$ as E,d6 as t,fC as V,dF as H,d7 as x}from"./index-A6_k7o1J.js";import{h as M}from"./CopyableText-CQapvaMr-B96GRr5a.js";import{n as C}from"./ScreenLayout-D73wYqNX-q_Oloqqd.js";import{t as Y}from"./InfoBanner-Cb3p1z12-Dv-WkFC3.js";import{w as q,c as O,p as K}from"./SelectSourceAsset-CuVkpdXI-BnRmnspW.js";import{c as N}from"./createLucideIcon-604B8ye0.js";import{H as X}from"./hourglass-Boa9ogCa.js";import{C as Z}from"./check-DinxiXFI.js";import{C as U}from"./circle-x-wMY5aI3M.js";import"./copy-DoC5TiQs.js";import"./ModalFooter-CEqrNWY7-DlsHzfO-.js";import"./Screen-C7bUGqXu-DWykNzqZ.js";import"./index-CWARkn2w-DHM8Z4Ob.js";import"./chevron-down-BPMsAFP5.js";/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=[["path",{d:"m16 11 2 2 4-4",key:"9rsbq5"}],["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]],J=N("user-check",G),Q=e=>{try{return e.location.origin}catch{return}},ee=({data:e,onClose:a})=>t.jsx(C,{showClose:!0,onClose:a,title:"Initiate bank transfer",subtitle:"Use the details below to complete a bank transfer from your bank.",primaryCta:{label:"Done",onClick:a},watermark:!1,footerText:"Exchange rates and fees are set when you authorize and determine the amount you receive. You'll see the applicable rates and fees for your transaction separately",children:t.jsx(te,{children:(V[e.deposit_instructions.asset]||[]).map((([l,h],g)=>{let m=e.deposit_instructions[l];if(!m||Array.isArray(m))return null;let d=l==="asset"?m.toUpperCase():m,i=d.length>100?`${d.slice(0,9)}...${d.slice(-9)}`:d;return t.jsxs(se,{children:[t.jsx(re,{children:h}),t.jsx(M,{value:d,includeChildren:H.isMobile,children:t.jsx(oe,{children:i})})]},g)}))})});let te=x.ol`
  border-color: var(--privy-color-border-default);
  border-width: 1px;
  border-radius: var(--privy-border-radius-mdlg);
  border-style: solid;
  display: flex;
  flex-direction: column;

  && {
    padding: 0 1rem;
  }
`,se=x.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;

  &:not(:first-of-type) {
    border-top: 1px solid var(--privy-color-border-default);
  }

  & > {
    :nth-child(1) {
      flex-basis: 30%;
    }

    :nth-child(2) {
      flex-basis: 60%;
    }
  }
`,re=x.span`
  color: var(--privy-color-foreground);
  font-kerning: none;
  font-variant-numeric: lining-nums proportional-nums;
  font-feature-settings: 'calt' off;

  /* text-xs/font-regular */
  font-size: 0.75rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.125rem; /* 150% */

  text-align: left;
  flex-shrink: 0;
`,oe=x.span`
  color: var(--privy-color-foreground);
  font-kerning: none;
  font-feature-settings: 'calt' off;

  /* text-sm/font-medium */
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.375rem; /* 157.143% */

  text-align: right;
  word-break: break-all;
`;const ae=({onClose:e})=>t.jsx(C,{showClose:!0,onClose:e,icon:U,iconVariant:"error",title:"Something went wrong",subtitle:"We couldn't complete account setup. This isn't caused by anything you did.",primaryCta:{label:"Close",onClick:e},watermark:!0}),ne=({onClose:e,reason:a})=>{let l=a?a.charAt(0).toLowerCase()+a.slice(1):void 0;return t.jsx(C,{showClose:!0,onClose:e,icon:U,iconVariant:"error",title:"Identity verification failed",subtitle:l?`We can't complete identity verification because ${l}. Please try again or contact support for assistance.`:"We couldn't verify your identity. Please try again or contact support for assistance.",primaryCta:{label:"Close",onClick:e},watermark:!0})},ie=({onClose:e,email:a})=>t.jsx(C,{showClose:!0,onClose:e,icon:X,title:"Identity verification in progress",subtitle:"We're waiting for Persona to approve your identity verification. This usually takes a few minutes, but may take up to 24 hours.",primaryCta:{label:"Done",onClick:e},watermark:!0,children:t.jsxs(Y,{theme:"light",children:["You'll receive an email at ",a," once approved with instructions for completing your deposit."]})}),le=({onClose:e,onAcceptTerms:a,isLoading:l})=>t.jsx(C,{showClose:!0,onClose:e,icon:J,title:"Verify your identity to continue",subtitle:"Finish verification with Persona — it takes just a few minutes and requires a government ID.",helpText:t.jsxs(t.Fragment,{children:[`This app uses Bridge to securely connect accounts and move funds. By clicking "Accept," you agree to Bridge's`," ",t.jsx("a",{href:"https://www.bridge.xyz/legal",target:"_blank",rel:"noopener noreferrer",children:"Terms of Service"})," ","and"," ",t.jsx("a",{href:"https://www.bridge.xyz/legal/row-privacy-policy/bridge-building-limited",target:"_blank",rel:"noopener noreferrer",children:"Privacy Policy"}),"."]}),primaryCta:{label:"Accept and continue",onClick:a,loading:l},watermark:!0}),ce=({onClose:e})=>t.jsx(C,{showClose:!0,onClose:e,icon:Z,iconVariant:"success",title:"Identity verified successfully",subtitle:"We've successfully verified your identity. Now initiate a bank transfer to view instructions.",primaryCta:{label:"Initiate bank transfer",onClick:()=>{},loading:!0},watermark:!0}),ue=({opts:e,onClose:a,onBack:l,onEditSourceAsset:h,onSelectAmount:g,isLoading:m})=>t.jsxs(C,{showClose:!0,onClose:a,showBack:!!l,onBack:l,headerTitle:`Buy ${e.destination.asset.toLocaleUpperCase()}`,primaryCta:{label:"Continue",onClick:g,loading:m},watermark:!0,children:[t.jsx(O,{currency:e.source.selectedAsset,inputMode:"decimal",autoFocus:!0}),t.jsx(K,{selectedAsset:e.source.selectedAsset,onEditSourceAsset:h})]}),de=({onClose:e,onBack:a,onAcceptTerms:l,onSelectAmount:h,onSelectSource:g,onEditSourceAsset:m,opts:d,state:i,email:v,isLoading:n})=>i.status==="select-amount"?t.jsx(ue,{onClose:e,onBack:a,onSelectAmount:h,onEditSourceAsset:m,opts:d,isLoading:n}):i.status==="select-source-asset"?t.jsx(q,{onSelectSource:g,opts:d,isLoading:n}):i.status==="kyc-prompt"?t.jsx(le,{onClose:e,onAcceptTerms:l,opts:d,isLoading:n}):i.status==="kyc-incomplete"?t.jsx(ie,{onClose:e,email:v}):i.status==="kyc-success"?t.jsx(ce,{onClose:e}):i.status==="kyc-error"?t.jsx(ne,{onClose:e,reason:i.reason}):i.status==="account-details"?t.jsx(ee,{onClose:e,data:i.data}):i.status==="create-customer-error"||i.status==="get-customer-error"?t.jsx(ae,{onClose:e}):null,Se={component:()=>{let{user:e}=P(),a=z().data;if(!(a!=null&&a.FundWithBankDepositScreen))throw Error("Missing data");let{onSuccess:l,onFailure:h,onBack:g,opts:m,createOrUpdateCustomer:d,getCustomer:i,getOrCreateVirtualAccount:v}=a.FundWithBankDepositScreen,[n,S]=y.useState(m),[k,r]=y.useState({status:"select-amount"}),[j,c]=y.useState(null),[T,o]=y.useState(!1),b=y.useRef(null),_=y.useCallback((async()=>{var w,f;let s;o(!0),c(null);try{s=await i({kycRedirectUrl:window.location.origin})}catch(u){if(!u||typeof u!="object"||!("status"in u)||u.status!==404)return r({status:"get-customer-error"}),c(u),void o(!1)}if(!s)try{s=await d({hasAcceptedTerms:!1,kycRedirectUrl:window.location.origin})}catch(u){return r({status:"create-customer-error"}),c(u),void o(!1)}if(!s)return r({status:"create-customer-error"}),c(Error("Unable to create customer")),void o(!1);if(s.status==="not_started"&&s.kyc_url)return r({status:"kyc-prompt",kycUrl:s.kyc_url}),void o(!1);if(s.status==="not_started")return r({status:"get-customer-error"}),c(Error("Unexpected user state")),void o(!1);if(s.status==="rejected")return r({status:"kyc-error",reason:(f=(w=s.rejection_reasons)==null?void 0:w[0])==null?void 0:f.reason}),c(Error("User KYC rejected.")),void o(!1);if(s.status==="incomplete")return r({status:"kyc-incomplete"}),void o(!1);if(s.status!=="active")return r({status:"get-customer-error"}),c(Error("Unexpected user state")),void o(!1);s.status;try{let u=await v({destination:n.destination,provider:n.provider,source:{asset:n.source.selectedAsset}});r({status:"account-details",data:u})}catch(u){return r({status:"create-customer-error"}),c(u),void o(!1)}}),[n]),L=y.useCallback((async()=>{var u,B;if(c(null),o(!0),k.status!=="kyc-prompt")return c(Error("Unexpected state")),void o(!1);let s=R({location:k.kycUrl});try{await d({hasAcceptedTerms:!0})}catch(p){return s&&!s.closed&&s.close(),r({status:"create-customer-error"}),c(p),void o(!1)}if(!s)return c(Error("Unable to begin kyc flow.")),o(!1),void r({status:"create-customer-error"});b.current=new AbortController;let w=await(async(p,I)=>{let A=await E({operation:async()=>({done:Q(p)===window.location.origin,closed:p.closed}),until:({done:$,closed:D})=>$||D,delay:0,interval:500,attempts:360,signal:I});return A.status==="aborted"?(p.close(),{status:"aborted"}):A.status==="max_attempts"?{status:"timeout"}:A.result.done?(p.close(),{status:"redirected"}):{status:"closed"}})(s,b.current.signal);if(w.status==="aborted")return;if(w.status==="closed")return void o(!1);w.status;let f=await E({operation:()=>i({}),until:p=>p.status==="active"||p.status==="rejected",delay:0,interval:2e3,attempts:60,signal:b.current.signal});if(f.status!=="aborted"){if(f.status==="max_attempts")return r({status:"kyc-incomplete"}),void o(!1);if(f.status,f.result.status==="rejected")return r({status:"kyc-error",reason:(B=(u=f.result.rejection_reasons)==null?void 0:u[0])==null?void 0:B.reason}),c(Error("User KYC rejected.")),void o(!1);if(f.result.status!=="active")return r({status:"kyc-incomplete"}),void o(!1);s.closed||s.close(),f.result.status;try{r({status:"kyc-success"});let p=await v({destination:n.destination,provider:n.provider,source:{asset:n.source.selectedAsset}});r({status:"account-details",data:p})}catch(p){r({status:"create-customer-error"}),c(p)}finally{o(!1)}}}),[r,c,o,d,v,k,n,b]),F=y.useCallback((s=>{r({status:"select-amount"}),S({...n,source:{...n.source,selectedAsset:s}})}),[r,S]),W=y.useCallback((()=>{r({status:"select-source-asset"})}),[r]);return t.jsx(de,{onClose:y.useCallback((async()=>{var s;(s=b.current)==null||s.abort(),!n.showBackButton||k.status!=="select-amount"&&k.status!=="select-source-asset"?j?h(j):await l():h(Error("User cancelled funding"))}),[j,b,h,l,n.showBackButton,k.status]),onBack:g,opts:n,state:k,isLoading:T,email:e.email.address,onAcceptTerms:L,onSelectAmount:_,onSelectSource:F,onEditSourceAsset:W})}};export{Se as FundWithBankDepositScreen,Se as default};

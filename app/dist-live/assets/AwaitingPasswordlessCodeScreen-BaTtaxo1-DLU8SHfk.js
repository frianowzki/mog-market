import{d3 as t,d1 as ae,d2 as Q,d9 as te,dH as ne,dD as Z,d6 as r,dU as S,dc as b,dP as ie,dF as se,d7 as C}from"./index-A6_k7o1J.js";import{F as le}from"./EnvelopeIcon-Bu2R8a_q.js";import{F as ce}from"./PhoneIcon-BbQkp1jV.js";import{o as de}from"./Layouts-CaU-iybi-BeSrCZrM.js";import{i as ue}from"./Link-BdDilT2T-C80XtISj.js";import{a as pe}from"./shouldProceedtoEmbeddedWalletCreationFlow-BhRtNzxm-C5Fd0yz3.js";import{n as me}from"./ScreenLayout-D73wYqNX-q_Oloqqd.js";import"./ModalFooter-CEqrNWY7-DlsHzfO-.js";import"./Screen-C7bUGqXu-DWykNzqZ.js";import"./index-CWARkn2w-DHM8Z4Ob.js";function fe({title:o,titleId:m,...A},f){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:f,"aria-labelledby":m},A),o?t.createElement("title",{id:m},o):null,t.createElement("path",{fillRule:"evenodd",d:"M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z",clipRule:"evenodd"}))}const ve=t.forwardRef(fe),he=({contactMethod:o,authFlow:m,emailDomain:A,appName:f="Privy",whatsAppEnabled:D=!1,onBack:s,onCodeSubmit:N,onResend:M,errorMessage:w,success:y=!1,resendCountdown:L=0,onInvalidInput:_,onClearError:v,resetCodeSignal:T})=>{let[h,x]=t.useState(J);t.useEffect((()=>{x(J)}),[T]);let O=async u=>{var E;u.preventDefault();let l=u.currentTarget.value.replace(" ","");if(l==="")return;if(isNaN(Number(l)))return void(_==null?void 0:_("Code should be numeric"));v==null||v();let d=Number((E=u.currentTarget.name)==null?void 0:E.charAt(5)),a=[...l||[""]].slice(0,G-d),c=[...h.slice(0,d),...a,...h.slice(d+a.length)];x(c);let g=Math.min(Math.max(d+a.length,0),G-1);if(!isNaN(Number(u.currentTarget.value))){let n=document.querySelector(`input[name=code-${g}]`);n==null||n.focus()}if(c.every((n=>n&&!isNaN(+n)))){let n=document.querySelector(`input[name=code-${g}]`);n==null||n.blur(),await(N==null?void 0:N(c.join("")))}};return r.jsx(me,{title:"Enter confirmation code",subtitle:r.jsxs("span",m==="email"?{children:["Please check ",r.jsx(ee,{children:o})," for an email from"," ",A??"privy.io"," and enter your code below."]}:{children:["Please check ",r.jsx(ee,{children:o})," for a",D?" WhatsApp":""," message from ",f," and enter your code below."]}),icon:m==="email"?le:ce,onBack:s,showBack:!0,helpText:r.jsxs(be,{children:[r.jsxs("span",{children:["Didn't get ",m==="email"?"an email":"a message","?"]}),L?r.jsxs(we,{children:[r.jsx(ve,{color:"var(--privy-color-foreground)",strokeWidth:1.33,height:"12px",width:"12px"}),r.jsx("span",{children:"Code sent"})]}):r.jsx(ue,{as:"button",size:"sm",onClick:M,children:"Resend code"})]}),children:r.jsx(ye,{children:r.jsx(de,{children:r.jsxs(Ee,{children:[r.jsx("div",{children:h.map(((u,l)=>r.jsx("input",{name:`code-${l}`,type:"text",value:h[l],onChange:O,onKeyUp:d=>{d.key==="Backspace"&&(a=>{if(v==null||v(),x([...h.slice(0,a),"",...h.slice(a+1)]),a>0){let c=document.querySelector(`input[name=code-${a-1}]`);c==null||c.focus()}})(l)},inputMode:"numeric",autoFocus:l===0,pattern:"[0-9]",className:`${y?"success":""} ${w?"fail":""}`,autoComplete:se.isMobile?"one-time-code":"off"},l)))}),r.jsx(Se,{$fail:!!w,$success:y,children:r.jsx("span",{children:w==="Invalid or expired verification code"?"Incorrect code":w||(y?"Success!":"")})})]})})})})};let G=6,J=Array(6).fill("");var R,k,xe=((R=xe||{})[R.RESET_AFTER_DELAY=0]="RESET_AFTER_DELAY",R[R.CLEAR_ON_NEXT_VALID_INPUT=1]="CLEAR_ON_NEXT_VALID_INPUT",R),ge=((k=ge||{})[k.EMAIL=0]="EMAIL",k[k.SMS=1]="SMS",k);const Me={component:()=>{var U,P,W;let{navigate:o,lastScreen:m,navigateBack:A,setModalData:f,onUserCloseViaDialogOrKeybindRef:D}=ae(),s=Q(),{closePrivyModal:N,resendEmailCode:M,resendSmsCode:w,getAuthMeta:y,loginWithCode:L,updateWallets:_,createAnalyticsEvent:v}=te(),{authenticated:T,logout:h,user:x}=ne(),{whatsAppEnabled:O}=Q(),[u,l]=t.useState(!1),[d,a]=t.useState(null),[c,g]=t.useState(null),[E,n]=t.useState(0),[re,oe]=t.useState(0);D.current=()=>null;let j=(U=y())!=null&&U.email?0:1,$=j===0?((P=y())==null?void 0:P.email)||"":((W=y())==null?void 0:W.phoneNumber)||"",F=Z-500;return t.useEffect((()=>{if(E){let i=setTimeout((()=>{n(E-1)}),1e3);return()=>clearTimeout(i)}}),[E]),t.useEffect((()=>{if(T&&u&&x){if(s!=null&&s.legal.requireUsersAcceptTerms&&!x.hasAcceptedTerms){let i=setTimeout((()=>{o("AffirmativeConsentScreen")}),F);return()=>clearTimeout(i)}if(pe(x,s.embeddedWallets)){let i=setTimeout((()=>{f({createWallet:{onSuccess:()=>{},onFailure:p=>{console.error(p),v({eventName:"embedded_wallet_creation_failure_logout",payload:{error:p,screen:"AwaitingPasswordlessCodeScreen"}}),h()},callAuthOnSuccessOnClose:!0}}),o("EmbeddedWalletOnAccountCreateScreen")}),F);return()=>clearTimeout(i)}{_();let i=setTimeout((()=>N({shouldCallAuthOnSuccess:!0,isSuccess:!0})),Z);return()=>clearTimeout(i)}}}),[T,u,x]),t.useEffect((()=>{if(d&&c===0){let i=setTimeout((()=>{a(null),g(null),oe((I=>I+1));let p=document.querySelector("input[name=code-0]");p==null||p.focus()}),1400);return()=>clearTimeout(i)}}),[d,c]),r.jsx(he,{contactMethod:$,authFlow:j===0?"email":"sms",emailDomain:s==null?void 0:s.appearance.emailDomain,appName:s==null?void 0:s.name,whatsAppEnabled:O,onBack:()=>A(),onCodeSubmit:async i=>{var p,I,B,V,q,K,z,H,X,Y;try{await L(i),l(!0)}catch(e){if(e instanceof S&&e.privyErrorCode===b.INVALID_CREDENTIALS)a("Invalid or expired verification code"),g(0);else if(e instanceof S&&e.privyErrorCode===b.CANNOT_LINK_MORE_OF_TYPE)a(e.message);else{if(e instanceof S&&e.privyErrorCode===b.USER_LIMIT_REACHED)return console.error(new ie(e).toString()),void o("UserLimitReachedScreen");if(e instanceof S&&e.privyErrorCode===b.USER_DOES_NOT_EXIST)return void o("AccountNotFoundScreen");if(e instanceof S&&e.privyErrorCode===b.LINKED_TO_ANOTHER_USER)return f({errorModalData:{error:e,previousScreen:m??"AwaitingPasswordlessCodeScreen"}}),void o("ErrorScreen",!1);if(e instanceof S&&e.privyErrorCode===b.DISALLOWED_PLUS_EMAIL)return f({inlineError:{error:e}}),void o("ConnectOrCreateScreen",!1);if(e instanceof S&&e.privyErrorCode===b.ACCOUNT_TRANSFER_REQUIRED&&((I=(p=e.data)==null?void 0:p.data)!=null&&I.nonce))return f({accountTransfer:{nonce:(V=(B=e.data)==null?void 0:B.data)==null?void 0:V.nonce,account:$,displayName:(z=(K=(q=e.data)==null?void 0:q.data)==null?void 0:K.account)==null?void 0:z.displayName,linkMethod:j===0?"email":"sms",embeddedWalletAddress:(Y=(X=(H=e.data)==null?void 0:H.data)==null?void 0:X.otherUser)==null?void 0:Y.embeddedWalletAddress}}),void o("LinkConflictScreen");a("Issue verifying code"),g(0)}}},onResend:async()=>{n(30),j===0?await M():await w()},errorMessage:d||void 0,success:u,resendCountdown:E,onInvalidInput:i=>{a(i),g(1)},onClearError:()=>{c===1&&(a(null),g(null))},resetCodeSignal:re})}};let ye=C.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
  gap: 16px;
  flex-grow: 1;
  width: 100%;
`,Ee=C.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;

  > div:first-child {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    border-radius: var(--privy-border-radius-sm);

    > input {
      border: 1px solid var(--privy-color-foreground-4);
      background: var(--privy-color-background);
      border-radius: var(--privy-border-radius-sm);
      padding: 8px 10px;
      height: 48px;
      width: 40px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      color: var(--privy-color-foreground);
      transition: all 0.2s ease;
    }

    > input:focus {
      border: 1px solid var(--privy-color-foreground);
      box-shadow: 0 0 0 1px var(--privy-color-foreground);
    }

    > input:invalid {
      border: 1px solid var(--privy-color-error);
    }

    > input.success {
      border: 1px solid var(--privy-color-border-success);
      background: var(--privy-color-success-bg);
    }

    > input.fail {
      border: 1px solid var(--privy-color-border-error);
      background: var(--privy-color-error-bg);
      animation: shake 180ms;
      animation-iteration-count: 2;
    }
  }

  @keyframes shake {
    0% {
      transform: translate(1px, 0);
    }
    33% {
      transform: translate(-1px, 0);
    }
    67% {
      transform: translate(-1px, 0);
    }
    100% {
      transform: translate(1px, 0);
    }
  }
`,Se=C.div`
  line-height: 20px;
  min-height: 20px;
  font-size: 14px;
  font-weight: 400;
  color: ${o=>o.$success?"var(--privy-color-success-dark)":o.$fail?"var(--privy-color-error-dark)":"transparent"};
  display: flex;
  justify-content: center;
  width: 100%;
  text-align: center;
`,be=C.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: var(--privy-color-foreground-2);
`,we=C.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--privy-border-radius-sm);
  padding: 2px 8px;
  gap: 4px;
  background: var(--privy-color-background-2);
  color: var(--privy-color-foreground-2);
`,ee=C.span`
  font-weight: 500;
  word-break: break-all;
  color: var(--privy-color-foreground);
`;export{Me as AwaitingPasswordlessCodeScreen,he as AwaitingPasswordlessCodeScreenView,Me as default};

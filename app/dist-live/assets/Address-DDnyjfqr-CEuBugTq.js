import{d3 as p,d6 as e,dj as d,d7 as t}from"./index-A6_k7o1J.js";import{f as m}from"./ModalFooter-CEqrNWY7-DlsHzfO-.js";import{C as x}from"./check-DinxiXFI.js";import{C as f}from"./copy-DoC5TiQs.js";const v=({address:r,showCopyIcon:i,url:n,className:a})=>{let[s,c]=p.useState(!1);function l(o){o.stopPropagation(),navigator.clipboard.writeText(r).then((()=>c(!0))).catch(console.error)}return p.useEffect((()=>{if(s){let o=setTimeout((()=>c(!1)),3e3);return()=>clearTimeout(o)}}),[s]),e.jsxs(h,n?{children:[e.jsx(j,{title:r,className:a,href:`${n}/address/${r}`,target:"_blank",children:d(r)}),i&&e.jsx(m,{onClick:l,size:"sm",style:{gap:"0.375rem"},children:e.jsxs(e.Fragment,s?{children:["Copied",e.jsx(x,{size:16})]}:{children:["Copy",e.jsx(f,{size:16})]})})]}:{children:[e.jsx(g,{title:r,className:a,children:d(r)}),i&&e.jsx(m,{onClick:l,size:"sm",style:{gap:"0.375rem",fontSize:"14px"},children:e.jsxs(e.Fragment,s?{children:["Copied",e.jsx(x,{size:14})]}:{children:["Copy",e.jsx(f,{size:14})]})})]})};let h=t.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`,g=t.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--privy-color-foreground);
`,j=t.a`
  font-size: 14px;
  color: var(--privy-color-foreground);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;export{v as d};

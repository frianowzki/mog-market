import { instrumentSerif, archivo, jetbrainsMono } from "./fonts.js";
import Providers from "./providers.jsx";
import "./styles.css";

/* No pinch-zoom, no double-tap zoom, no auto text inflation at any width. */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export const metadata = {
  title: "Motion Markets — trade the top KOLs on X",
  description:
    "Motion Markets: trade the Motion leaderboard of top KOLs on X, settled onchain on Fluent Testnet.",
  applicationName: "Motion Markets",
  icons: { icon: "/brand/fluentscan-180.png" },
  openGraph: {
    title: "Motion Markets",
    description: "Trade the Motion leaderboard of top KOLs on X, settled onchain on Fluent Testnet.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Motion Markets",
    description: "Trade the Motion leaderboard of top KOLs on X, settled onchain on Fluent Testnet.",
  },
};

/* Paint the saved theme before first paint so dark mode never flashes white. */
const THEME_BOOT = `(function(){try{
  var m=localStorage.getItem('mm.theme')||'auto';
  var d=m==='dark'||(m==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  var r=document.documentElement;
  r.setAttribute('data-theme',d?'dark':'light');
  r.style.colorScheme=d?'dark':'light';
}catch(e){}})();`;

/* Zoom lock. The viewport meta already forbids scaling, but iOS Safari still
   honours pinch in some contexts and Android webviews can override
   user-scalable. These handlers cover both: block multi-touch pinch
   (gesturestart/change on Safari, 2-finger touchmove elsewhere) and the
   double-tap that zooms when a tap is not recognised as a click. Single-finger
   scrolling is untouched, so the app still feels native. */
const ZOOM_LOCK = `(function(){
  var block=function(e){e.preventDefault();};
  document.addEventListener('gesturestart',block,{passive:false});
  document.addEventListener('gesturechange',block,{passive:false});
  document.addEventListener('gestureend',block,{passive:false});
  document.addEventListener('touchmove',function(e){
    if(e.touches && e.touches.length>1) e.preventDefault();
  },{passive:false});
  var lastTap=0;
  document.addEventListener('touchend',function(e){
    var now=Date.now();
    if(now-lastTap<=320) e.preventDefault();
    lastTap=now;
  },{passive:false});
  /* Ctrl+wheel (trackpad pinch on desktop) is a zoom shortcut too. */
  document.addEventListener('wheel',function(e){
    if(e.ctrlKey) e.preventDefault();
  },{passive:false});
  /* Some webviews restore a zoom level from bfcache — snap it back. */
  window.addEventListener('pageshow',function(){
    var v=document.querySelector('meta[name=viewport]');
    if(v) v.setAttribute('content','width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover');
  });
})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${archivo.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <script dangerouslySetInnerHTML={{ __html: ZOOM_LOCK }} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="HandheldFriendly" content="true" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

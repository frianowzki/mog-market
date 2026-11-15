# HANDOFF — MOG Market (Motion Markets)

> Dibaca **paling awal** setelah `/new`. Jangan baca file lain dulu kecuali disebut di sini.

## Tujuan
Port komponen Framer ke app Next.js `mog-market` (landing + terminal), lalu verifikasi live di Vercel. **NO LOCAL BUILD** — PC lambat. Semua verifikasi lewat push → Vercel build → curl/Playwright ke URL live.

## Keputusan yang sudah diambil (JANGAN diulang/debat)
1. **ThemeSwitch Terminal tetap versi lokal**, bukan komponen Framer. Komponen Framer binary (light/dark); Terminal butuh 3-way `auto|light|dark` yang dipakai `useTheme()`. Import-nya sudah dibuang dari Terminal.jsx + komentar alasannya.
2. 5 komponen Framer batch 2 (MorphPillCard, LiquidGlassFooter, AnimatedGradients, ThemeSwitch, ScrollIndicator) **sudah semua ke-wire** dan live.
3. Board `/app` di-gate login X — jadi komponen board (deck-row, mpc-wrap) tidak render tanpa auth. **Bukan bug**, by design.
4. Verifikasi visual pakai Playwright headless (chromium ada di `~/AppData/Local/ms-playwright`). Script harus ditaruh **di dalam** `app/` supaya bisa resolve `node_modules`.

## Status file
- Repo: `C:\Users\friok\projects\mog-market` (subdir app = `app/`)
- Branch: `master`, deployed & verified live
- Live: https://mog-market.vercel.app — landing 200, /app 200, /api/motion/leaderboard 200 (79 creators)
- Komponen: `app/src/components/*.jsx` (5 batch-2 sudah terpasang)
- Wiring landing: `app/app/Landing.jsx`; terminal: `app/src/Terminal.jsx`

## QA bypass yang SUDAH ADA
`/app?shot=1` → skip login gate pakai alamat dummy `0x7007...f097`. Bukan route baru, sudah built-in di `Terminal.jsx` (`devShot`). Pakai ini untuk screenshot tanpa login X.

## Bug yang sudah difix & verified
1. `import ThemeSwitch` di Terminal.jsx di-shadow deklarasi lokal → dibuang.
2. `.deck-row` kolom `minmax(190px)` → `250px` (lebar card open).
3. `.mpc.open` kurang `align-items: stretch` → `.mpc-foot` numpuk di atas harga. Fixed.
4. Card open absolute meluber dari wrapper 40px → wrapper sekarang reservasi `min-height:300px` via `:has(.mpc.open)`.
   Terukur: card 250×300, wrapper 300px, overlap ke pill lain = **0** (verified via getBoundingClientRect).

## Next steps
1. Cek halaman lain (Portfolio, Settings) apakah kena isu serupa.
2. Responsive: `@media (max-width:860px)` pakai `position: relative` — perlu dicek ulang setelah perubahan wrapper.
3. Screenshot board bisa dipakai buat dokumentasi/README.

## Catatan teknis
- acc lime `#d7ff3e`; Landing pakai `--lp-ink/--lp-mute`, Terminal pakai `--ink/--ink2/--mute`
- `priceOf` landing = number, `mog.js` = BigInt; netWorth BigInt wei → `/1e18` untuk CountUp
- `useTheme()` di `src/mog.js`: mode auto|light|dark, resolved → `data-theme`
- Commit style: conventional-ish singkat, push ke `master` langsung

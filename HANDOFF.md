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

### Batch mobile + kontras (16 Nov, verified di production)
5. **`.pane` melar 1263px.** `.pane{display:grid}` tanpa `grid-template-columns` → track implisit `auto` = max-content. Rail isinya grid scroll horizontal dengan max-content ~1263px, jadi pane ikut melar di SEMUA viewport; rail gak pernah scroll, cuma dipotong `body overflow-x:hidden`. Fix: `grid-template-columns:minmax(0,1fr)`. Terukur: doc overflow 390px turun **903px → 0**.
6. **Card open kepotong di mobile.** `.deck-row` punya `overflow-x:auto` → cross axis ikut ke-clip, card 300px di row 44px kejebak. Fix: `position:relative` + wrapper `min-height:0` di mobile. Terukur `clippedV:0 clippedH:0` di 390/360/820/861.
7. **Teks putih di atas putih (light theme).** `.mpc.open` pakai `var(--paper2)` = `#ebe7dd` di light, teksnya tetap cream `#f4f1ea`. Fix: pin surface `#14110e` + teks cream eksplisit (termasuk `.mpc-rank`, `.mpc-foot`, `.mpc-delta.flat`). Verified `cardBg rgb(20,17,14)`.
8. **Nama kepotong "D…".** `.mpc-info` selalu `flex:1 1 auto` walau card TERTUTUP → makan 180px, himpit `.mpc-rest` jadi 28px dari butuh 58px. Kejadian juga di desktop 1280. Fix: `.mpc:not(.open) .mpc-info{flex:0 0 0;width:0;max-width:0;padding-inline:0;overflow:hidden}`.
9. **Pill closed gak ngisi sel (desktop).** Setelah fix #8 pill jadi content-width → void ~200px di kanan tiap sel. Catatan: `flex:1 1 auto` GAK ngefek karena `.mpc-wrap` itu `display:block` — harus `width:100%`. Animasi morph tetap jalan (verified 339→260→250 per rAF).

## PELAJARAN PENTING
- **Jangan verifikasi lewat `addStyleTag` lalu `waitForTimeout` untuk animasi.** Sampler rAF menunjukkan transisi normal, sementara `waitForTimeout(120)` baca nilai awal (339) dan bikin salah kesimpulan "snap".
- **`data-theme=light` itu default.** Semua komponen baru wajib dites di light, bukan cuma dark — bug #7 cuma muncul di light.
- **Avatar 404 dari upstream `leaderboard.motion.game/pfp/*.jpg`** (8 dari 8). Bukan bug kita, tapi bikin semua avatar jadi bulatan hitam kosong. Kalau mau dibenerin: fallback inisial/silhouette + ring.

## Temuan terbuka (belum dikerjakan)
- **Dead space vertikal di desktop** saat card open: grid strict per-row, jadi sel sebelah (pill 40px) ikut melar setinggi card 300px → ±520px area kosong. Opsi: masonry column flow, atau card open span 2 kolom.
- Card open 250px di dalam sel 290–340px → sisa ~40–90px kosong di kanan. Kosmetik.
- `.mpc-rest` gak punya `max-width` guard untuk nama super panjang (sekarang aman, `max-width:130px` ada tapi tidak dipakai sebagai ellipsis guard konsisten).
- Bahasa header "HOVER A FACE" gak relevan di touch (mobile gak ada hover).

## Next steps
1. Cek halaman lain (Portfolio, Settings) apakah kena isu `.pane` serupa.
2. Dead space vertikal desktop (lihat temuan terbuka).
3. Fallback avatar kalau upstream pfp 404.
4. Screenshot board buat dokumentasi/README.

## Catatan teknis
- acc lime `#d7ff3e`; Landing pakai `--lp-ink/--lp-mute`, Terminal pakai `--ink/--ink2/--mute`
- `priceOf` landing = number, `mog.js` = BigInt; netWorth BigInt wei → `/1e18` untuk CountUp
- `useTheme()` di `src/mog.js`: mode auto|light|dark, resolved → `data-theme`
- Commit style: conventional-ish singkat, push ke `master` langsung

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
- Branch: `master`, HEAD = `c947287` (pushed, deployed)
- Live: https://mog-market.vercel.app — landing 200, /app 200, /api/motion/leaderboard 200 (79 creators)
- Komponen: `app/src/components/*.jsx` (5 batch-2 sudah terpasang)
- Wiring landing: `app/app/Landing.jsx`; terminal: `app/src/Terminal.jsx`

## Next steps (prioritas)
1. **Task aktif user:** bikin route bypass gate `/app?preview=1` (atau `?qa=1`) untuk QA — supaya board + MorphPillCard bisa diverifikasi visual tanpa login X. Harus aman: hanya mengubah tampilan, TIDAK membuka aksi write/tx.
2. Verifikasi MorphPillCard morph (hover: 40px → card) via Playwright di route preview.
3. Screenshot board + deck-row sebagai bukti, kirim ke Telegram.
4. Setelah itu: update skill/checkpoint, commit + push.

## Catatan teknis
- acc lime `#d7ff3e`; Landing pakai `--lp-ink/--lp-mute`, Terminal pakai `--ink/--ink2/--mute`
- `priceOf` landing = number, `mog.js` = BigInt; netWorth BigInt wei → `/1e18` untuk CountUp
- `useTheme()` di `src/mog.js`: mode auto|light|dark, resolved → `data-theme`
- Commit style: conventional-ish singkat, push ke `master` langsung

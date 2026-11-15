# CHECKPOINT — komponen Framer batch 2 (Motion Markets)

Batch 1 (16–20) selesai semua di disk, BELUM di-wire, BELUM di-push.

## Files dibuat (semua di app/src/components/)
16. MorphPillCard.jsx + morph-pill-card.css   — morph pill card (avatar 40px → card 250×300)
17. LiquidGlassFooter.jsx + liquid-glass-footer.css
18. AnimatedGradients.jsx + animated-gradients.css  — variant noise|lava|holo
19. ThemeSwitch.jsx + theme-switch.css
20. ScrollIndicator.jsx + scroll-indicator.css

## TODO wiring
- Landing.jsx: import 5 komponen + CSS; ganti <footer className="lp-foot"> jadi <LiquidGlassFooter columns=.../>
- Landing.jsx: taruh <ScrollIndicator/> di hero + <AnimatedGradients/> sebagai background
- Terminal.jsx: <AnimatedGradients variant="noise"/> di belakang board
- Theme switch: cek topbar Terminal ada tombol tema? ganti/pasang <ThemeSwitch mode={theme} onChange={setTheme}/>
- MorphPillCard: pasang di board creator (grid/list) sebagai hover reveal

## Catatan teknis
- useTheme() di src/mog.js: mode = "auto"|"light"|"dark", resolved menentukan data-theme
- Landing pakai var --lp-ink/--lp-mute; Terminal pakai var --ink/--ink2/--mute
- goo-acc = #d7ff3e (accent lime)
- priceOf landing = number, priceOf mog.js = BigInt
- netWorth = BigInt wei → CountUp butuh Number(x)/1e18

## Ref screenshots: m1.png (morph open), r-footer.png, r-gradients.png, r-theme.png, r-scroll.png

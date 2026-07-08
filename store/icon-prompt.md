# Prompt pro AI generátor ikony (záloha k app-icon.svg)

Hotová vektorová ikona je v `store/app-icon.svg` (export do PNG: 1024×1024 pro
`assets/icon.png`, 512×512 pro Play Console). Pokud chceš raději vygenerovat
ikonu jinou AI (Midjourney, DALL-E, Ideogram…), použij tento prompt:

## Prompt (anglicky – generátory rozumí lépe)
```
Flat vector app icon, 1024x1024, neo-brutalist style. A friendly cartoon
caricature of a businessman mascot: round face, big oval white eyes with dark
pupils, grey-beige swept hair, big ears, small smiling dark-red mouth, dark
navy suit collar with a red tie. Bold dark navy (#15233B) outlines, 3px+
stroke weight everywhere, hard offset shadows. Bright yellow background
(#FFD60A), one or two small gold coins with "Kč" symbol in corners.
Centered composition, full-bleed square, no text, no gradients, no 3D,
clean flat cartoon shapes, playful satirical mood. Style similar to Duolingo
mascot flatness but neo-brutalist with thick dark outlines.
```

## Parametry / poznámky
- **Barvy:** pozadí #FFD60A (žlutá), linky #15233B (tmavě navy), pleť #F4C9A0,
  vlasy #C7BFAE/#B9B1A0, kravata #E23B2E, mince #FFE680.
- **Bez textu** – název se zobrazuje pod ikonou.
- **Bez průhlednosti**, plný čtverec (Google Play si rohy zakulatí sám).
- Výstupy, které potřebuješ:
  - `assets/icon.png` – 1024×1024 (iOS + obecná)
  - Play Console ikona – 512×512 PNG
  - adaptivní Android ikony (`assets/android-icon-foreground/background/monochrome.png`)
    – foreground = jen hlava maskota bez pozadí, background = žlutá plocha.

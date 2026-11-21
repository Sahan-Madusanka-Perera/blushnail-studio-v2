# Blush Nail Studio: concept landing page (Tip Board)

A second concept site for **Blush Nail Studio (Nails by Genevieve)**, Bexley North, Sydney, made by Seqlith as an unsolicited pitch. The first concept, *The Velvet Vitrine*, lives in `../blush-nail-studio-site`.

Direction: **The Sample-Tip Board**. Every nail tech has a board of sample tips on the wall that clients point at. Here Genevieve's real sets become that board:
- a hot-pink painted wall;
- white acrylic boards held up by chrome screws;
- each set cut into its real tip shape (almond, stiletto, coffin or square) with a gel gloss;
- black Dymo-tape labels.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/ (deploy to Vercel as a Vite project)
```

## What's on the page

| Section | Content |
|---|---|
| Hero | "Pick your set." with Book via Instagram DM; a tilted acrylic board with one giant almond tip (editorial still) and three of her real sets |
| Statement | One artist, one chair |
| The tip board | 24 sets as tips. Filter by shape and by finish (matching tips move to the front). Tap a tip to open the set, then "Ask for this set" (copies a ready message, opens the DM) |
| What she does | Gel, Acrylic, Gel-X, Nail art. No prices; every row says "Ask for a quote" |
| Booking | 4 Dymo-tape steps plus a board with suburb, live booking status (Sydney time), hours and a Maps link |
| Close | "Your hands, next." with the DM button |

## Replace before going live

1. **The hero still is a placeholder**, not Genevieve's work: `public/img/hero/model-*.webp` comes from Unsplash photo 1754799670380 (Unsplash licence). Swap it for a photo of her own client's hands. The footer already says it is a placeholder.
2. **Set names** in `src/sets.js` are titles written for this concept, and Genevieve can rename them. The dates are the real Instagram posting months.
3. **Prices**: none are shown. Add them to the service rows if she wants.
4. **Reviews and ratings**: none are shown, because none were supplied.
5. The nail photos come from her public Instagram (@blushnail.studio). Get her OK before publishing.

## Source material

The raw photos are in `../blush-nail-studio-site/_raw/`. The tip crops in `public/img/tips/` were cut from them at a 1 : 1.55 ratio.

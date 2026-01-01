# Annie's 2025 Wrapped — Scroll scrapbook

Single-page, scroll-driven recap built with Next.js (App Router), TypeScript, Tailwind, Framer Motion, and D3. Everything you see on the page is powered by one data file: `app/data/2025.json`.

## Quickstart

```bash
npm install   # fetch deps (framer-motion, d3, clsx)
npm run dev
```

If the registry is blocked in your environment, update `package.json` (already set) then run `npm install` when you have connectivity.

## How to edit your content

All copy, images, and stats live in `app/data/2025.json`:
- `site` / `hero`: title, subtitle, collage images, quick stats
- `recapCards`: the red “post-it” summary lines
- `running`: totals, month-by-month data, streak days
- `reading`: top books and genre counts
- `articles`: scrollytelling chart states and callouts
- `emails`: monthly stacked counts, correspondents (supports privacy toggle), threads
- `calendar`: event type counts, weekday rhythm, recurring titles
- `photos`: masonry gallery + lightbox captions
- `ending`: final theme + share image attribution

Swap URLs or numbers, save, and the page will update. Use local `/public` assets by dropping files there and pointing JSON URLs to `/your-file.jpg`.

## Features
- Hero collage with parallax and “scroll to open” hint
- Bold red post-it recap cards with playful rotation
- Running section with D3 monthly bars + streak micro-heatmap and Miles/Runs toggle
- Reading section with hoverable book notes and a genre distribution graphic
- Articles scrollytelling: sticky chart morphs between topics and reading lengths
- Email section with privacy toggle, stacked bars, and thread chips
- Calendar rhythm grid (Mon–Sun vs. time of day) and event-type chips
- Photo masonry with hover captions and a simple lightbox
- Ending card with “Generate share image” (client-side canvas)
- Prefers-reduced-motion respected across animations

## Deploy

Optimized for Vercel. Run `npm run build && npm start` to test the production build locally once dependencies are installed.

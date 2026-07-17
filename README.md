# Wrapped, built with Unlayer Elements

**A Spotify-Wrapped-style personal year-in-review — dark-mode-native, typography-led, and every single chart drawn with `Row`s and `Column`s. Zero images. One data object. Two render modes.**

`#BuiltWithElements`

Unlayer's [template gallery](https://unlayer.com/templates) is light-mode marketing emails built on stock photos. This goes the other way: the one email people actually screenshot and share every year — the annual recap every fitness app, dev tool, and learning platform sends — designed the way 2026 email design actually works: **dark-mode-native, the number is the hero, and hyper-personalized by construction.**

---

## The two modes

| Mode | Component | Output | Screenshot |
|---|---|---|---|
| **Wrapped email (primary)** | `<Email>` | table-based HTML + `text/plain` + editor JSON | [email](demo/output/screenshots/email-maya-chen.png) |
| Shareable web version | `<Page>` | responsive div/flexbox HTML | [page](demo/output/screenshots/page-maya-chen.png) |

Two sample users, two completely different brands from one hex color each:

| Devflow (coding app) | Stride (running app) |
|---|---|
| ![Devflow Wrapped](demo/output/screenshots/email-maya-chen.png) | ![Stride Wrapped](demo/output/screenshots/email-jonas-weber.png) |

---

## What makes it original

- **Every visualization is layout, not images.** There is not a single `<img>` in the entire template:
  - The **monthly heat strip** is 12 `Column`s whose background intensity is the data — the peak month burns in the accent color.
  - The **top-5 ranked bars** are `Row cells={[pct, 100 - pct]}` — the bar width *is* the percentage, and the bar color walks the brand→accent gradient down the ranking.
  - The **gradient bands** bracketing the design are 8 `Column`s stepping between the two brand colors.
  - No chart library, no hosted assets — it renders crisp in every client, forever.
- **It cannot break in dark mode, because it *is* dark mode.** Dark-mode rendering is the #1 thing email clients mangle (inverted logos, vanished borders). A dark-mode-native design sidesteps the entire problem class — and matches where 2026 email design is going.
- **Hyper-personalized by construction.** [`lib/generate-content.ts`](lib/generate-content.ts) turns raw product-analytics numbers (12 monthly values, a top list, a streak) into a flat `WrappedContent` object — intensities, rank percentages, comparison copy. The templates are pure functions of it, so an LLM or an analytics pipeline can populate it just as easily.
- **One hex color re-themes everything.** Brand + accent drive the heat strip, the ranked bars, the gradient bands, the persona card, the CTA — the two demo brands share 100% of the template code.

## Elements is core — exactly how

- **Root wrappers:** `<Email>` and `<Page>` — same shared sections, two render modes.
- **Structure:** strict `wrapper → Row → Column → content` throughout; all charts driven by `Row cells` ratios and per-`Column` background colors.
- **Components:** `Heading`, `Paragraph`, `Button`, `Divider`, `Column`, `Row`.
- **Render functions:** `renderToHtml` (both modes), `renderToPlainText` (the email's `text/plain` MIME part), `renderToJson` (emits Unlayer design JSON — **round-trips into the visual editor**).

## Run it

```bash
npm install
npm run render           # → demo/output/*.{html,txt,design.json}
npm run render:screens   # same, plus PNG screenshots via headless Chrome
```

Outputs land in [`demo/output/`](demo/output/) — one set per user in [`demo/sample-input.json`](demo/sample-input.json) (two fictional products: a coding app and a running app).

## Project layout

```
lib/generate-content.ts   raw yearly numbers → flat WrappedContent (the "AI-populatable" seam)
templates/
  sections.tsx            shared Row/Column sections — heat strip, ranked bars, stat grid, persona card
  wrapped-email.tsx       <Email> — the Wrapped recap (primary)
  wrapped-page.tsx        <Page>  — the shareable web version
render.tsx                generateContent → renderToHtml/PlainText/Json → files (+ screenshots)
demo/sample-input.json    two fictional users/products
```

---

Built with and grateful to [**Unlayer Elements**](https://github.com/unlayer/elements) (MIT) — ⭐ starred and supported. `#BuiltWithElements`

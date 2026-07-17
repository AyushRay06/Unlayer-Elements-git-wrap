/**
 * Render pipeline: sample input → generateContent() → Elements templates →
 * email HTML + plain-text part + design JSON + page HTML (+ optional PNGs).
 *
 *   npm run render           # HTML / txt / design.json for every user
 *   npm run render:screens   # same, plus PNG screenshots via headless Chrome
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToHtml, renderToPlainText, renderToJson } from "@unlayer/react-elements";
import { generateContent, type WrappedInput } from "./lib/generate-content";
import { wrappedEmail } from "./templates/wrapped-email";
import { wrappedPage } from "./templates/wrapped-page";
import { wrappedPoster } from "./templates/wrapped-poster";

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, "demo", "output");
mkdirSync(outDir, { recursive: true });

const wantScreens = process.argv.includes("--screens");
const CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
];
const chrome = CHROME_PATHS.find(existsSync);

const inputs: WrappedInput[] = JSON.parse(
  readFileSync(join(root, "demo", "sample-input.json"), "utf8"),
);

for (const input of inputs) {
  const slug = input.user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const c = generateContent(input);
  const out = (name: string, data: string) => {
    writeFileSync(join(outDir, `${slug}.${name}`), data);
    console.log(`  ✓ ${slug}.${name}`);
  };

  console.log(`\n${input.user.name} — ${input.product.name} ${input.year} Wrapped`);

  // The charts ARE the layout, so the heat strip and gradient bands must keep
  // their proportions on mobile instead of stacking to full width. The renderer's CSS
  // ships a `.no-stack` escape hatch (with per-width rules already generated) but no
  // prop emits the class — so we add it selectively. Avoid it on label rows and stat
  // grids so they stack cleanly on narrow screens.
  const noStack = (html: string) => {
    // Split into rows and add no-stack ONLY if the row is a pure chart grid:
    // — heat strip: 12 cols of u-col-12p5 (8x for page strips, 12x for email)
    // — gradient band: 8 cols of u-col-12p5 (not u-col-*p5 but truly 12.5%)
    // Exclude label rows [2,8,3] and stat grids [50,50] so they stack on mobile.
    const parts = html.split(/(?=<div class="u-row (?:no-stack )?v-row-columns)/);
    return parts.map((part, i) => {
      if (i === 0) return part; // header before first row
      const match = /class="u-row (?:no-stack )?v-row-columns/.exec(part);
      if (!match) return part;
      // Detect chart rows by their column signatures
      const colsInRow = (part.match(/u-col u-col-[0-9p]+/g) || []).slice(0, 20);
      const cols = colsInRow.map(c => c.split('-').pop());
      // Keep no-stack on: 12 identical cols (heat strip) or 8 identical cols (gradient/page strip)
      const isChart = (cols.length === 12 && cols.every(c => c === cols[0])) ||
                      (cols.length === 8 && cols.every(c => c === cols[0]));
      if (!isChart) return part; // remove any existing no-stack from label/grid rows
      return part.replace(/class="(u-row) (?:no-stack )?/, 'class="$1 no-stack '); // ensure it's there
    }).join('');
  };

  // 1. <Email> — the Wrapped recap (html + text/plain part + editor JSON)
  const email = wrappedEmail(c);
  out("email.html", noStack(renderToHtml(email, { title: `Your ${c.year} ${c.product.name} Wrapped` })));
  out("email.txt", renderToPlainText(email));
  out("email.design.json", JSON.stringify(renderToJson(email), null, 2)); // round-trips into Unlayer's visual editor

  // 2. <Page> — the shareable web version
  out("page.html", noStack(renderToHtml(wrappedPage(c), { title: `${c.user.firstName}'s ${c.year} Wrapped — ${c.product.name}` })));

  // 3. <Document> — the printable Year Poster (print backgrounds forced on)
  // Force print backgrounds + a custom single poster-sized page.
  const posterHtml = renderToHtml(wrappedPoster(c), { title: `${c.user.firstName}'s ${c.year} Wrapped Poster` })
    .replace(
      "</head>",
      // Document mode appends a page-break separator div — a one-page poster doesn't want it.
      "<style>*{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:800px 1330px;margin:0}body{margin:0}div[style*='page-break-before']{display:none!important}</style></head>",
    );
  out("poster.html", posterHtml);
  if (chrome) {
    execFileSync(chrome, [
      "--headless",
      "--disable-gpu",
      "--no-pdf-header-footer",
      `--print-to-pdf=${join(outDir, `${slug}.poster.pdf`)}`,
      join(outDir, `${slug}.poster.html`),
    ], { stdio: "pipe" });
    console.log(`  ✓ ${slug}.poster.pdf`);
  }

  // 4. PNG screenshots via headless Chrome (for the README)
  if (wantScreens) {
    if (!chrome) {
      console.warn("  ⚠ Chrome not found — skipping screenshots.");
    } else {
      const shotsDir = join(outDir, "screenshots");
      mkdirSync(shotsDir, { recursive: true });
      for (const [mode, file, width, height] of [
        ["email", "email", 640, 2560],
        ["email-mobile", "email", 375, 5800],  // stacked layout (labels + grids stack on mobile) is ~2.3x the desktop height
        ["page", "page", 900, 2620],
        ["poster", "poster", 800, 1330],
      ] as const) {
        execFileSync(chrome, [
          "--headless",
          "--disable-gpu",
          "--hide-scrollbars",
          "--force-device-scale-factor=2",
          `--window-size=${width},${height}`,
          `--screenshot=${join(shotsDir, `${mode}-${slug}.png`)}`,
          join(outDir, `${slug}.${file}.html`),
        ], { stdio: "pipe" });
        console.log(`  ✓ screenshots/${mode}-${slug}.png`);
      }
    }
  }
}

console.log(`\nDone → demo/output/`);

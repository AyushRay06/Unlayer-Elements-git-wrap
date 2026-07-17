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

  // 1. <Email> — the Wrapped recap (html + text/plain part + editor JSON)
  const email = wrappedEmail(c);
  out("email.html", renderToHtml(email, { title: `Your ${c.year} ${c.product.name} Wrapped` }));
  out("email.txt", renderToPlainText(email));
  out("email.design.json", JSON.stringify(renderToJson(email), null, 2)); // round-trips into Unlayer's visual editor

  // 2. <Page> — the shareable web version
  out("page.html", renderToHtml(wrappedPage(c), { title: `${c.user.firstName}'s ${c.year} Wrapped — ${c.product.name}` }));

  // 3. PNG screenshots via headless Chrome (for the README)
  if (wantScreens) {
    if (!chrome) {
      console.warn("  ⚠ Chrome not found — skipping screenshots.");
    } else {
      const shotsDir = join(outDir, "screenshots");
      mkdirSync(shotsDir, { recursive: true });
      for (const [mode, width, height] of [["email", 640, 2560], ["page", 900, 2620]] as const) {
        execFileSync(chrome, [
          "--headless",
          "--disable-gpu",
          "--force-device-scale-factor=2",
          `--window-size=${width},${height}`,
          `--screenshot=${join(shotsDir, `${mode}-${slug}.png`)}`,
          join(outDir, `${slug}.${mode}.html`),
        ], { stdio: "pipe" });
        console.log(`  ✓ screenshots/${mode}-${slug}.png`);
      }
    }
  }
}

console.log(`\nDone → demo/output/`);

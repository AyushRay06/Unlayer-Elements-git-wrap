/**
 * Shared sections — Unlayer Elements Row/Column trees rendered identically
 * inside <Email> and <Page>. Every visualization here is drawn with layout:
 * the monthly heat strip, the ranked bars, the gradient bands — zero <img>,
 * zero custom HTML. The data literally IS the layout (Row `cells` ratios and
 * per-Column background colors), so it renders crisp in every email client
 * and never breaks in dark mode because the whole design is dark-mode-native.
 *
 * Sections are plain functions returning Row arrays (not components) so the
 * element tree handed to renderToHtml/renderToJson contains only literal
 * <Row> children — keeping renderToJson round-tripping to the visual editor.
 */
import { Row, Column, ColumnLayouts, Heading, Paragraph, Divider } from "@unlayer/react-elements";
import type { WrappedContent } from "../lib/generate-content";

export const SANS = { label: "Helvetica", value: "helvetica,arial,sans-serif" };
export const SERIF = { label: "Georgia", value: "georgia,'times new roman',serif" };

// Dark-mode-native palette — the canvas is the night, brand colors are the light.
export const CANVAS = "#0A0A12";
export const CARD = "#14141F";
export const CARD2 = "#1C1C2A";
export const INK = "#FFFFFF";
export const MUTED = "#9298AC";
export const FAINT = "#565B70";

/** Mix two hex colors (t = 0 → a, t = 1 → b). */
export const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) =>
    Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * t);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0")}`;
};
export const shade = (hex: string, amt: number) => mix(hex, "#000000", amt);
export const tint = (hex: string, amt: number) => mix(hex, "#ffffff", amt);

/** Micro-label — the tiny letterspaced all-caps eyebrow above every section. */
export function eyebrow(text: string, color = MUTED, align: "left" | "center" = "center") {
  return (
    <Paragraph
      html={`<span style="letter-spacing:3px">${text.toUpperCase()}</span>`}
      fontSize="10px"
      color={color}
      textAlign={align}
      fontFamily={SANS}
    />
  );
}

/**
 * Decorative gradient band — 8 Columns stepping brand → accent. Pure layout
 * color; doubles as the design signature between sections.
 */
export function gradientBand(c: WrappedContent, pad = "0px") {
  const { brandColor, accentColor } = c.product;
  const steps = 8;
  return [
    <Row key="band" cells={Array(steps).fill(1)} padding={pad} backgroundColor={CANVAS} noStackMobile>
      {Array.from({ length: steps }, (_, i) => (
        <Column key={i} padding="0px" backgroundColor={mix(brandColor, accentColor, i / (steps - 1))}>
          <Paragraph html="&nbsp;" fontSize="4px" lineHeight="100%" />
        </Column>
      ))}
    </Row>,
  ];
}

/**
 * Monthly heat strip — 12 Columns, one per month, background intensity driven
 * by the data (dim months fade into the canvas, the peak month burns in the
 * accent color). A chart with no chart library and no images.
 */
export function heatStrip(c: WrappedContent, pad = "40px") {
  const { brandColor, accentColor } = c.product;
  const cellColor = (m: WrappedContent["months"][number]) =>
    m.isPeak ? accentColor : mix(CARD2, brandColor, 0.08 + 0.92 * m.intensity);
  return [
    <Row key="strip" cells={Array(12).fill(1)} padding={`4px ${pad} 0px`} backgroundColor={CANVAS} noStackMobile>
      {c.months.map((m, i) => (
        <Column key={i} padding="0px" backgroundColor={cellColor(m)}>
          <Paragraph html="&nbsp;" fontSize="10px" lineHeight="340%" />
        </Column>
      ))}
    </Row>,
    <Row key="labels" cells={Array(12).fill(1)} padding={`2px ${pad} 0px`} backgroundColor={CANVAS} noStackMobile>
      {c.months.map((m, i) => (
        <Column key={i} padding="0px">
          <Paragraph
            html={m.isPeak ? `<b>${m.letter}</b>` : m.letter}
            fontSize="10px"
            color={m.isPeak ? accentColor : FAINT}
            textAlign="center"
            fontFamily={SANS}
          />
        </Column>
      ))}
    </Row>,
    <Row key="peak" layout={ColumnLayouts.OneColumn} padding={`8px ${pad} 0px`} backgroundColor={CANVAS}>
      <Column padding="0px">
        <Paragraph html={c.peakMonth} fontSize="13px" color={MUTED} textAlign="center" fontFamily={SANS} lineHeight="150%" />
      </Column>
    </Row>,
  ];
}

/**
 * Ranked top-5 — oversized rank numerals and horizontal bars whose widths ARE
 * the data: `Row cells={[pct, 100 - pct]}`, colored cell vs. canvas cell.
 * Bar color walks the brand → accent gradient down the ranking.
 */
export function rankedBars(c: WrappedContent, pad = "40px") {
  const { brandColor, accentColor } = c.product;
  const n = c.topList.items.length;
  return c.topList.items.flatMap((it) => {
    const barColor = mix(accentColor, brandColor, n === 1 ? 0 : (it.rank - 1) / (n - 1));
    return [
      <Row key={`t${it.rank}`} cells={[2, 8, 3]} padding={`10px ${pad} 0px`} backgroundColor={CANVAS} noStackMobile>
        <Column padding="0px">
          <Heading level="h3" fontSize="30px" fontWeight={800} color={barColor} textAlign="left" fontFamily={SANS}>
            {String(it.rank)}
          </Heading>
        </Column>
        <Column padding="4px 0px 0px">
          <Paragraph html={`<b>${it.name}</b>`} fontSize="16px" color={INK} fontFamily={SANS} lineHeight="120%" />
          {it.detail ? (
            <Paragraph html={it.detail} fontSize="11px" color={MUTED} fontFamily={SANS} lineHeight="130%" />
          ) : null}
        </Column>
        <Column padding="8px 0px 0px">
          <Paragraph
            html={`<b>${it.valueFmt}</b> ${c.topList.unit}`}
            fontSize="12px"
            color={MUTED}
            textAlign="right"
            fontFamily={SANS}
          />
        </Column>
      </Row>,
      <Row key={`b${it.rank}`} cells={[it.pct, 100 - it.pct]} padding={`4px ${pad} 2px`} backgroundColor={CANVAS} noStackMobile>
        <Column padding="0px" backgroundColor={barColor} borderRadius="99px">
          <Paragraph html="&nbsp;" fontSize="4px" lineHeight="150%" />
        </Column>
        <Column padding="0px" backgroundColor={CARD}>
          <Paragraph html="&nbsp;" fontSize="4px" lineHeight="150%" />
        </Column>
      </Row>,
    ];
  });
}

/** One tile of the 2×2 stat grid — micro-label, big number, caption. */
export function statTile(label: string, value: string, sub: string, valueColor: string) {
  return [
    eyebrow(label, FAINT, "left"),
    <Heading key="v" level="h3" fontSize="30px" fontWeight={800} color={valueColor} textAlign="left" fontFamily={SANS} lineHeight="110%">
      {value}
    </Heading>,
    <Paragraph key="s" html={sub} fontSize="11px" color={MUTED} fontFamily={SANS} lineHeight="140%" />,
  ];
}

/** 2×2 stat grid — streak, peak day, percentile, months active. */
export function statGrid(c: WrappedContent, pad = "40px") {
  const { brandColor, accentColor } = c.product;
  const active = c.months.filter((m) => m.intensity > 0).length;
  const tiles: [string, string, string, string][] = [];
  if (c.streak) tiles.push(["Longest streak", c.streak.daysFmt, c.streak.label, accentColor]);
  if (c.peakDay) tiles.push(["Biggest day", c.peakDay.date, c.peakDay.detail, INK]);
  if (c.percentile) tiles.push(["Where you rank", `Top ${c.percentile}`, `of everyone on ${c.product.name} this year`, brandColor]);
  tiles.push(["Months active", `${active}/12`, "you kept showing up", INK]);

  const rows = [];
  for (let i = 0; i < tiles.length; i += 2) {
    const pair = tiles.slice(i, i + 2);
    rows.push(
      <Row
        key={`g${i}`}
        layout={pair.length === 2 ? ColumnLayouts.TwoEqual : ColumnLayouts.OneColumn}
        padding={`${i === 0 ? 4 : 10}px ${pad} 0px`}
        backgroundColor={CANVAS}
      >
        {pair.map(([label, value, sub, color], j) => (
          <Column
            key={j}
            padding="16px 18px"
            backgroundColor={CARD}
            borderRadius="12px"
          >
            {statTile(label, value, sub, color)}
          </Column>
        ))}
      </Row>,
    );
  }
  return rows;
}

/**
 * Persona card — the shareable "you are…" moment. Brand-colored card, serif
 * italic display type; the one loud color block in the whole design.
 */
export function personaCard(c: WrappedContent, pad = "40px") {
  const bg = shade(c.product.brandColor, 0.25);
  return [
    <Row key="persona" layout={ColumnLayouts.OneColumn} padding={`18px ${pad} 0px`} backgroundColor={CANVAS}>
      <Column padding="30px 28px" backgroundColor={bg} borderRadius="14px">
        {eyebrow(`Your ${c.year} personality`, tint(c.product.brandColor, 0.65), "center")}
        <Heading level="h2" fontSize="38px" fontWeight={700} color={INK} textAlign="center" fontFamily={SERIF} lineHeight="115%">
          {c.persona.title}
        </Heading>
        <Paragraph
          html={`<i>${c.persona.blurb}</i>`}
          fontSize="14px"
          color={tint(c.product.brandColor, 0.8)}
          textAlign="center"
          fontFamily={SERIF}
          lineHeight="160%"
        />
      </Column>
    </Row>,
  ];
}

/** Thin brand-tinted rule used to close sections. */
export function sectionRule(c: WrappedContent, pad = "40px") {
  return [
    <Row key="rule" layout={ColumnLayouts.OneColumn} padding={`26px ${pad} 6px`} backgroundColor={CANVAS}>
      <Column padding="0px">
        <Divider borderTopWidth="1px" borderTopColor={CARD2} />
      </Column>
    </Row>,
  ];
}

/**
 * <Document> — the Year Poster. One printable page: the whole year condensed
 * into a shareable poster (giant year, hero number, heat strip, top 3,
 * persona). Same shared sections as the email and page — third render mode,
 * same data model. Pipe through headless Chrome for the PDF.
 */
import {
  Document,
  Row,
  Column,
  ColumnLayouts,
  Heading,
  Paragraph,
} from "@unlayer/react-elements";
import { withUnit, type WrappedContent } from "../lib/generate-content";
import {
  gradientBand,
  heatStrip,
  statTile,
  eyebrow,
  mix,
  shade,
  tint,
  SANS,
  SERIF,
  CANVAS,
  CARD,
  INK,
  MUTED,
  FAINT,
} from "./sections";

export function wrappedPoster(c: WrappedContent) {
  const brand = c.product.brandColor;
  const accent = c.product.accentColor;
  const PAD = "48px";
  const top3 = c.topList.items.slice(0, 3);

  return (
    <Document backgroundColor={CANVAS} contentWidth="700px" textColor={INK}>
      {/* Masthead */}
      <Row layout={ColumnLayouts.TwoWideNarrow} backgroundColor={CANVAS} padding={`34px ${PAD} 0px`}>
        <Column padding="0px">
          <Paragraph html={`<b>${c.product.name}</b>`} fontSize="16px" color={INK} fontFamily={SANS} />
        </Column>
        <Column padding="2px 0px 0px">
          <Paragraph
            html={`<span style="letter-spacing:3px">${c.user.name.toUpperCase()}</span>`}
            fontSize="10px"
            color={MUTED}
            textAlign="right"
            fontFamily={SANS}
          />
        </Column>
      </Row>
      {gradientBand(c, `10px ${PAD} 0px`)}

      {/* Hero — year + metric side by side to save vertical space */}
      <Row layout={ColumnLayouts.TwoEqual} backgroundColor={CANVAS} padding={`26px ${PAD} 0px`}>
        <Column padding="0px">
          <Heading level="h1" fontSize="96px" fontWeight={800} color={INK} textAlign="left" fontFamily={SANS} lineHeight="100%">
            {c.year}
          </Heading>
          <Heading level="h2" fontSize="40px" fontWeight={400} color={accent} textAlign="left" fontFamily={SERIF} lineHeight="105%">
            Wrapped.
          </Heading>
        </Column>
        <Column padding="14px 0px 0px">
          {eyebrow(`You ${c.metric.verb}`, MUTED, "left")}
          <Heading level="h2" fontSize="54px" fontWeight={800} color={brand} textAlign="left" fontFamily={SANS} lineHeight="105%">
            {c.metric.totalFmt}
          </Heading>
          <Paragraph html={`<b>${c.metric.label}</b>`} fontSize="14px" color={INK} fontFamily={SANS} />
          <Paragraph html={c.metric.comparison} fontSize="11px" color={MUTED} fontFamily={SANS} lineHeight="145%" />
        </Column>
      </Row>

      {/* Heat strip */}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`20px ${PAD} 0px`}>
        <Column padding="0px">{eyebrow("Month by month", FAINT, "left")}</Column>
      </Row>
      {heatStrip(c, PAD)}

      {/* Top 3 — compact tiles, rank color walks the gradient */}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`22px ${PAD} 0px`}>
        <Column padding="0px">{eyebrow(c.topList.title, MUTED, "left")}</Column>
      </Row>
      <Row layout={ColumnLayouts.ThreeEqual} backgroundColor={CANVAS} padding={`6px ${PAD} 0px`}>
        {top3.map((it) => {
          const rankColor = mix(accent, brand, top3.length === 1 ? 0 : (it.rank - 1) / 2);
          return (
            <Column key={it.rank} padding="14px 16px" backgroundColor={CARD} borderRadius="12px">
              <Heading level="h3" fontSize="26px" fontWeight={800} color={rankColor} textAlign="left" fontFamily={SANS} lineHeight="105%">
                {String(it.rank)}
              </Heading>
              <Paragraph html={`<b>${it.name}</b>`} fontSize="13px" color={INK} fontFamily={SANS} lineHeight="125%" />
              <Paragraph html={withUnit(it.valueFmt, c.topList.unit)} fontSize="11px" color={MUTED} fontFamily={SANS} />
            </Column>
          );
        })}
      </Row>

      {/* Receipts row — streak / rank / months active */}
      <Row layout={ColumnLayouts.ThreeEqual} backgroundColor={CANVAS} padding={`10px ${PAD} 0px`}>
        <Column padding="14px 16px" backgroundColor={CARD} borderRadius="12px">
          {statTile("Longest streak", c.streak?.daysFmt ?? "—", c.streak?.label ?? "", accent)}
        </Column>
        <Column padding="14px 16px" backgroundColor={CARD} borderRadius="12px">
          {statTile("Biggest day", c.peakDay?.date ?? "—", c.peakDay?.detail ?? "", INK)}
        </Column>
        <Column padding="14px 16px" backgroundColor={CARD} borderRadius="12px">
          {statTile(
            "Where you rank",
            c.percentile ? `Top ${c.percentile}` : `${c.months.filter((m) => m.intensity > 0).length}/12`,
            c.percentile ? `of everyone on ${c.product.name}` : "months active",
            brand,
          )}
        </Column>
      </Row>

      {/* Persona */}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`14px ${PAD} 0px`}>
        <Column padding="22px 26px" backgroundColor={shade(brand, 0.25)} borderRadius="14px">
          {eyebrow(`Your ${c.year} personality`, tint(brand, 0.65))}
          <Heading level="h2" fontSize="34px" fontWeight={700} color={INK} textAlign="center" fontFamily={SERIF} lineHeight="112%">
            {c.persona.title}
          </Heading>
          <Paragraph
            html={`<i>${c.persona.blurb}</i>`}
            fontSize="12px"
            color={tint(brand, 0.8)}
            textAlign="center"
            fontFamily={SERIF}
            lineHeight="150%"
          />
        </Column>
      </Row>

      {/* Footer */}
      {gradientBand(c, `18px ${PAD} 0px`)}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`10px ${PAD} 30px`}>
        <Column padding="0px">
          <Paragraph
            html={`${c.product.name}${c.product.tagline ? ` — ${c.product.tagline}` : ""} · ${c.user.firstName}'s ${c.year} in numbers`}
            fontSize="10px"
            color={FAINT}
            textAlign="center"
            fontFamily={SANS}
          />
        </Column>
      </Row>
    </Document>
  );
}

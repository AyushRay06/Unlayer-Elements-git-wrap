/**
 * <Email> — the Wrapped recap. Dark-mode-native, typography-led, zero images:
 * every visual is Rows, Columns, and color. Table-based HTML, safe for
 * Outlook/Gmail, and it can't break in dark mode because it *is* dark.
 */
import {
  Email,
  Row,
  Column,
  ColumnLayouts,
  Heading,
  Paragraph,
  Button,
} from "@unlayer/react-elements";
import type { WrappedContent } from "../lib/generate-content";
import {
  gradientBand,
  heatStrip,
  rankedBars,
  statGrid,
  personaCard,
  sectionRule,
  eyebrow,
  SANS,
  SERIF,
  CANVAS,
  INK,
  MUTED,
  FAINT,
  tint,
} from "./sections";

export function wrappedEmail(c: WrappedContent) {
  const brand = c.product.brandColor;
  const accent = c.product.accentColor;
  const PAD = "36px";

  return (
    <Email
      backgroundColor={CANVAS}
      contentWidth="600px"
      textColor={INK}
      previewText={`Your ${c.year} on ${c.product.name}: ${c.metric.totalFmt} ${c.metric.label}${c.percentile ? `, top ${c.percentile}` : ""} — see your Wrapped.`}
    >
      {/* Masthead */}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`26px ${PAD} 8px`}>
        <Column padding="0px">
          <Paragraph
            html={`<b>${c.product.name}</b>`}
            fontSize="15px"
            color={INK}
            textAlign="center"
            fontFamily={SANS}
          />
        </Column>
      </Row>
      {gradientBand(c, `0px ${PAD}`)}

      {/* Hero — the year, huge. */}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`34px ${PAD} 0px`}>
        <Column padding="0px">
          {eyebrow(`${c.user.firstName}, this was your year`, MUTED)}
          <Heading level="h1" fontSize="92px" fontWeight={800} color={INK} textAlign="center" fontFamily={SANS} lineHeight="100%">
            {c.year}
          </Heading>
          <Heading level="h2" fontSize="40px" fontWeight={400} color={accent} textAlign="center" fontFamily={SERIF} lineHeight="110%">
            Wrapped.
          </Heading>
        </Column>
      </Row>

      {/* Hero metric — the number is the hero. */}
      {sectionRule(c, PAD)}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`12px ${PAD} 0px`}>
        <Column padding="0px">
          {eyebrow(`You ${c.metric.verb}`, MUTED)}
          <Heading level="h2" fontSize="72px" fontWeight={800} color={brand} textAlign="center" fontFamily={SANS} lineHeight="105%">
            {c.metric.totalFmt}
          </Heading>
          <Paragraph
            html={`<b>${c.metric.label}</b>`}
            fontSize="16px"
            color={INK}
            textAlign="center"
            fontFamily={SANS}
          />
          <Paragraph html={c.metric.comparison} fontSize="13px" color={MUTED} textAlign="center" fontFamily={SANS} lineHeight="150%" />
        </Column>
      </Row>

      {/* Month-by-month heat strip */}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`22px ${PAD} 0px`}>
        <Column padding="0px">{eyebrow("Month by month", FAINT)}</Column>
      </Row>
      {heatStrip(c, PAD)}

      {/* Top 5 */}
      {sectionRule(c, PAD)}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`10px ${PAD} 0px`}>
        <Column padding="0px">{eyebrow(c.topList.title, MUTED)}</Column>
      </Row>
      {rankedBars(c, PAD)}

      {/* The receipts — stat grid */}
      {sectionRule(c, PAD)}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`10px ${PAD} 0px`}>
        <Column padding="0px">{eyebrow("The receipts", MUTED)}</Column>
      </Row>
      {statGrid(c, PAD)}

      {/* Persona */}
      {personaCard(c, PAD)}

      {/* CTA */}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`26px ${PAD} 6px`}>
        <Column padding="0px">
          <Button
            href={c.shareUrl}
            backgroundColor={accent}
            color="#0A0A12"
            fontSize="15px"
            fontWeight={700}
            padding="14px 30px"
            borderRadius="99px"
          >
            Share your Wrapped
          </Button>
          <Paragraph
            html={`See the full story, month by month, at <b>${c.product.name}</b>.`}
            fontSize="12px"
            color={MUTED}
            textAlign="center"
            fontFamily={SANS}
            lineHeight="160%"
          />
        </Column>
      </Row>

      {/* Footer */}
      {gradientBand(c, `18px ${PAD} 0px`)}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`14px ${PAD} 28px`}>
        <Column padding="0px">
          <Paragraph
            html={`${c.product.name}${c.product.tagline ? ` — ${c.product.tagline}` : ""}<br/>Numbers from your ${c.year} activity. Made with ♥ for ${c.user.firstName}.`}
            fontSize="10px"
            color={FAINT}
            textAlign="center"
            fontFamily={SANS}
            lineHeight="170%"
          />
        </Column>
      </Row>
    </Email>
  );
}

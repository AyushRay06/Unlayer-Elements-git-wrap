/**
 * <Page> — the "view your Wrapped" web version. Same shared sections as the
 * email (that's the point), wider canvas, div/flexbox HTML.
 */
import {
  Page,
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
} from "./sections";

export function wrappedPage(c: WrappedContent) {
  const brand = c.product.brandColor;
  const accent = c.product.accentColor;
  const PAD = "56px";

  return (
    <Page backgroundColor={CANVAS} contentWidth="680px" textColor={INK}>
      {/* Masthead */}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`34px ${PAD} 10px`}>
        <Column padding="0px">
          <Paragraph html={`<b>${c.product.name}</b>`} fontSize="16px" color={INK} textAlign="center" fontFamily={SANS} />
        </Column>
      </Row>
      {gradientBand(c, `0px ${PAD}`)}

      {/* Hero */}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`48px ${PAD} 0px`}>
        <Column padding="0px">
          {eyebrow(`${c.user.firstName}, this was your year`, MUTED)}
          <Heading level="h1" fontSize="120px" fontWeight={800} color={INK} textAlign="center" fontFamily={SANS} lineHeight="100%">
            {c.year}
          </Heading>
          <Heading level="h2" fontSize="48px" fontWeight={400} color={accent} textAlign="center" fontFamily={SERIF} lineHeight="110%">
            Wrapped.
          </Heading>
        </Column>
      </Row>

      {/* Hero metric */}
      {sectionRule(c, PAD)}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`16px ${PAD} 0px`}>
        <Column padding="0px">
          {eyebrow(`You ${c.metric.verb}`, MUTED)}
          <Heading level="h2" fontSize="88px" fontWeight={800} color={brand} textAlign="center" fontFamily={SANS} lineHeight="105%">
            {c.metric.totalFmt}
          </Heading>
          <Paragraph html={`<b>${c.metric.label}</b>`} fontSize="17px" color={INK} textAlign="center" fontFamily={SANS} />
          <Paragraph html={c.metric.comparison} fontSize="14px" color={MUTED} textAlign="center" fontFamily={SANS} lineHeight="150%" />
        </Column>
      </Row>

      {/* Month by month */}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`26px ${PAD} 0px`}>
        <Column padding="0px">{eyebrow("Month by month", FAINT)}</Column>
      </Row>
      {heatStrip(c, PAD)}

      {/* Top 5 */}
      {sectionRule(c, PAD)}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`12px ${PAD} 0px`}>
        <Column padding="0px">{eyebrow(c.topList.title, MUTED)}</Column>
      </Row>
      {rankedBars(c, PAD)}

      {/* Stat grid */}
      {sectionRule(c, PAD)}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`12px ${PAD} 0px`}>
        <Column padding="0px">{eyebrow("The receipts", MUTED)}</Column>
      </Row>
      {statGrid(c, PAD)}

      {/* Persona */}
      {personaCard(c, PAD)}

      {/* CTA */}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`32px ${PAD} 8px`}>
        <Column padding="0px">
          <Button
            href={c.shareUrl}
            backgroundColor={accent}
            color="#0A0A12"
            fontSize="16px"
            fontWeight={700}
            padding="15px 34px"
            borderRadius="99px"
          >
            Share your Wrapped
          </Button>
        </Column>
      </Row>

      {/* Footer */}
      {gradientBand(c, `22px ${PAD} 0px`)}
      <Row layout={ColumnLayouts.OneColumn} backgroundColor={CANVAS} padding={`16px ${PAD} 40px`}>
        <Column padding="0px">
          <Paragraph
            html={`${c.product.name}${c.product.tagline ? ` — ${c.product.tagline}` : ""} · your ${c.year} in numbers`}
            fontSize="11px"
            color={FAINT}
            textAlign="center"
            fontFamily={SANS}
            lineHeight="170%"
          />
        </Column>
      </Row>
    </Page>
  );
}

/**
 * Content generation: raw product-analytics numbers → plain content object.
 *
 * Templates are pure functions of WrappedContent. This module does all the
 * thinking — totals, monthly intensities, ranked-bar percentages, streaks,
 * comparison lines — so templates only lay things out.
 *
 * WrappedContent is deliberately flat/JSON-serializable: an LLM, a product
 * analytics pipeline, or a CSV row can produce it just as easily as this
 * deterministic generator does. That's the "hyper-personalized" seam.
 */

export interface WrappedInput {
  user: { name: string };
  product: {
    name: string;
    tagline?: string;
    url: string;
    brandColor: string; // hex — primary accent on the dark canvas
    accentColor?: string; // hex — secondary accent; defaults to brandColor
  };
  year: number;
  metric: {
    label: string; // "hours in flow" / "kilometers run"
    verb: string; // "coded" / "ran" — used in copy
    total: number;
    monthly: number[]; // 12 values, Jan..Dec
    weeklyComparison?: string; // optional custom "that's …" line
  };
  topList: {
    title: string; // "Your top languages"
    items: { name: string; value: number; detail?: string }[]; // any length; top 5 kept
    unit: string; // "hrs" / "km"
  };
  percentile?: number; // e.g. 3 → "top 3%"
  streak?: { days: number; label?: string }; // longest streak
  peakDay?: { date: string; detail: string }; // "March 14" / "9.2 hours in one sitting"
  persona: { title: string; blurb: string }; // "The Night Owl" + one sentence
  shareUrl: string;
}

export interface WrappedContent {
  user: { name: string; firstName: string };
  product: Required<Pick<WrappedInput["product"], "name" | "url" | "brandColor">> & {
    tagline: string;
    accentColor: string;
  };
  year: string;
  metric: {
    label: string;
    verb: string;
    totalFmt: string; // "1,284"
    comparison: string; // "That's 24.7 hours every single week."
  };
  /** Jan..Dec — intensity 0..1 (relative to peak month) + single-letter label. */
  months: { letter: string; intensity: number; isPeak: boolean }[];
  peakMonth: string; // "October was your biggest month — 186 hours."
  topList: {
    title: string;
    unit: string;
    /** pct is relative to the #1 item — drives the horizontal bar widths. */
    items: { rank: number; name: string; valueFmt: string; detail?: string; pct: number }[];
  };
  percentile: string | null; // "3%"
  streak: { daysFmt: string; label: string } | null;
  peakDay: { date: string; detail: string } | null;
  persona: { title: string; blurb: string };
  shareUrl: string;
}

const MONTH_LETTERS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function generateContent(input: WrappedInput): WrappedContent {
  const { metric, topList } = input;
  if (metric.monthly.length !== 12) throw new Error("metric.monthly must have 12 values (Jan..Dec)");

  const peakVal = Math.max(...metric.monthly);
  const peakIdx = metric.monthly.indexOf(peakVal);
  const months = metric.monthly.map((v, i) => ({
    letter: MONTH_LETTERS[i],
    intensity: peakVal ? v / peakVal : 0,
    isPeak: i === peakIdx,
  }));

  const top = [...topList.items].sort((a, b) => b.value - a.value).slice(0, 5);
  const maxTop = top[0]?.value ?? 1;

  const perWeek = metric.total / 52;
  const comparison =
    metric.weeklyComparison ??
    `That's ${perWeek >= 10 ? num.format(Math.round(perWeek)) : perWeek.toFixed(1)} ${metric.label.split(" ")[0]} every single week.`;

  return {
    user: { name: input.user.name, firstName: input.user.name.split(" ")[0] },
    product: {
      name: input.product.name,
      tagline: input.product.tagline ?? "",
      url: input.product.url,
      brandColor: input.product.brandColor,
      accentColor: input.product.accentColor ?? input.product.brandColor,
    },
    year: String(input.year),
    metric: {
      label: metric.label,
      verb: metric.verb,
      totalFmt: num.format(metric.total),
      comparison,
    },
    months,
    peakMonth: `${MONTH_NAMES[peakIdx]} was your biggest month — ${num.format(peakVal)} ${topList.unit}.`,
    topList: {
      title: topList.title,
      unit: topList.unit,
      items: top.map((it, i) => ({
        rank: i + 1,
        name: it.name,
        valueFmt: num.format(it.value),
        detail: it.detail,
        pct: Math.max(6, Math.round((it.value / maxTop) * 100)), // min 6 so no bar vanishes
      })),
    },
    percentile: input.percentile != null ? `${input.percentile}%` : null,
    streak: input.streak
      ? { daysFmt: num.format(input.streak.days), label: input.streak.label ?? "day streak" }
      : null,
    peakDay: input.peakDay ?? null,
    persona: input.persona,
    shareUrl: input.shareUrl,
  };
}

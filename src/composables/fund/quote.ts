const parseNullableNumber = (value: unknown): number | null => {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export interface RawFundQuote {
  NAV?: unknown;
  NAVCHGRT?: unknown;
  GSZ?: unknown;
  GSZZL?: unknown;
  PDATE?: string;
  GZTIME?: string | null;
}

export const resolveFundQuote = (quote: RawFundQuote) => {
  const nav = parseNullableNumber(quote.NAV);
  const navChangeRate = parseNullableNumber(quote.NAVCHGRT);
  const liveGsz = parseNullableNumber(quote.GSZ);
  const liveGszzl = parseNullableNumber(quote.GSZZL);
  const liveDate = quote.GZTIME?.slice(0, 10);
  const shouldUseNavFallback =
    liveGsz === null ||
    liveGszzl === null ||
    (!!quote.PDATE && quote.PDATE !== "--" && quote.PDATE === liveDate);

  return {
    dwjz: nav,
    gsz: shouldUseNavFallback ? nav : liveGsz,
    gszzl: shouldUseNavFallback ? (navChangeRate ?? 0) : (liveGszzl ?? 0),
    hasReplace: shouldUseNavFallback && nav !== null && navChangeRate !== null,
    gztime: quote.GZTIME ?? "",
  };
};

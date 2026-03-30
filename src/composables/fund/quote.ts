import type { FundQuoteResponseItem } from "@/types/fund";

const parseNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export type RawFundQuote = Pick<
  FundQuoteResponseItem,
  | "NAV"
  | "NAVCHGRT"
  | "GSZ"
  | "GSZZL"
  | "PDATE"
  | "GZTIME"
  | "NEWPRICE"
  | "CHANGERATIO"
  | "HQDATE"
>;

export const resolveFundQuote = (quote: RawFundQuote) => {
  const nav = parseNullableNumber(quote.NAV);
  const navChangeRate = parseNullableNumber(quote.NAVCHGRT);
  const liveGsz = parseNullableNumber(quote.GSZ);
  const liveGszzl = parseNullableNumber(quote.GSZZL);
  const liveDate = quote.GZTIME?.slice(0, 10);
  const exchangePrice = parseNullableNumber(quote.NEWPRICE);
  const exchangeChangeRate = parseNullableNumber(quote.CHANGERATIO);
  const hasExchangeQuote =
    exchangePrice !== null &&
    exchangeChangeRate !== null &&
    !!quote.HQDATE;
  const shouldUseLiveValuation =
    liveGsz !== null &&
    liveGszzl !== null &&
    !(!!quote.PDATE && quote.PDATE !== "--" && quote.PDATE === liveDate);
  const shouldUseNavFallback =
    !shouldUseLiveValuation && !hasExchangeQuote;

  if (shouldUseLiveValuation) {
    return {
      dwjz: nav,
      gsz: liveGsz,
      gszzl: liveGszzl,
      hasReplace: false,
      gztime: quote.GZTIME ?? "",
    };
  }

  if (hasExchangeQuote) {
    return {
      dwjz: nav,
      gsz: exchangePrice,
      gszzl: exchangeChangeRate,
      hasReplace: false,
      gztime: quote.HQDATE ?? "",
    };
  }

  return {
    dwjz: nav,
    gsz: shouldUseNavFallback ? nav : liveGsz,
    gszzl: shouldUseNavFallback ? (navChangeRate ?? 0) : (liveGszzl ?? 0),
    hasReplace: shouldUseNavFallback && nav !== null && navChangeRate !== null,
    gztime: quote.GZTIME ?? quote.PDATE ?? "",
  };
};

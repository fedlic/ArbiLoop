"use client";

import { useState, useCallback } from "react";

export type Currency = "JPY" | "USD" | "THB";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  JPY: "¥",
  USD: "$",
  THB: "฿",
};

const CURRENCY_LABELS: Record<Currency, string> = {
  JPY: "円 (JPY)",
  USD: "ドル (USD)",
  THB: "バーツ (THB)",
};

export function useCurrency(initial: Currency = "JPY") {
  const [currency, setCurrency] = useState<Currency>(initial);

  const cycle = useCallback(() => {
    setCurrency((prev) => {
      const order: Currency[] = ["JPY", "USD", "THB"];
      const idx = order.indexOf(prev);
      return order[(idx + 1) % order.length];
    });
  }, []);

  return {
    currency,
    setCurrency,
    cycle,
    symbol: CURRENCY_SYMBOLS[currency],
    label: CURRENCY_LABELS[currency],
  };
}

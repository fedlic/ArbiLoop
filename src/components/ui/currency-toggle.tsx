"use client";

import type { Currency } from "@/hooks/use-currency";

type Props = {
  currency: Currency;
  onToggle: () => void;
};

export function CurrencyToggle({ currency, onToggle }: Props) {
  const styles: Record<Currency, string> = {
    JPY: "bg-red-900/40 text-red-300",
    USD: "bg-green-900/40 text-green-300",
    THB: "bg-blue-900/40 text-blue-300",
  };

  return (
    <button
      onClick={onToggle}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${styles[currency]}`}
    >
      {currency}
    </button>
  );
}

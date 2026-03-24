"use client";

import { useState } from "react";

type Props = {
  productId: string;
  onSubmit: (data: {
    price: number;
    currency: string;
    country: string;
    shopName?: string;
    note?: string;
  }) => Promise<void>;
};

const COUNTRIES = [
  { code: "TH", label: "タイ", currency: "THB" },
  { code: "PH", label: "フィリピン", currency: "PHP" },
  { code: "US", label: "アメリカ", currency: "USD" },
];

export function LocalPriceForm({ productId: _productId, onSubmit }: Props) {
  const [price, setPrice] = useState("");
  const [countryIdx, setCountryIdx] = useState(0);
  const [shopName, setShopName] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const country = COUNTRIES[countryIdx];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({
        price: parseFloat(price),
        currency: country.currency,
        country: country.code,
        shopName: shopName || undefined,
        note: note || undefined,
      });
      setPrice("");
      setShopName("");
      setNote("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
    >
      <h3 className="text-sm font-medium text-[var(--text-secondary)]">
        現地価格を投稿
      </h3>

      {/* 国選択 */}
      <div className="flex gap-2">
        {COUNTRIES.map((c, i) => (
          <button
            key={c.code}
            type="button"
            onClick={() => setCountryIdx(i)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              i === countryIdx
                ? "bg-[var(--accent-blue)] text-white"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 価格入力 */}
      <div className="flex gap-2">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={`価格 (${country.currency})`}
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm focus:border-[var(--accent-blue)] focus:outline-none"
          required
        />
        <span className="flex items-center text-xs text-[var(--text-secondary)]">
          {country.currency}
        </span>
      </div>

      {/* 店舗名 */}
      <input
        type="text"
        value={shopName}
        onChange={(e) => setShopName(e.target.value)}
        placeholder="店舗名 (任意)"
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm focus:border-[var(--accent-blue)] focus:outline-none"
      />

      {/* メモ */}
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="メモ (任意)"
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm focus:border-[var(--accent-blue)] focus:outline-none"
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-[var(--accent-green)] py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "送信中..." : "投稿する"}
      </button>
    </form>
  );
}

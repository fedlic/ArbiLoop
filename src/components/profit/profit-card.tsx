"use client";

type ProfitData = {
  profitJpy: number;
  profitMargin: number;
  overseasPriceJpy: number;
  platformFeeJpy: number;
  shippingCostJpy: number;
  displayCurrency: string;
};

type Props = {
  data: ProfitData;
  source: string;
  taxFreePrice: number;
};

function formatJpy(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`;
}

export function ProfitCard({ data, source, taxFreePrice }: Props) {
  const isProfit = data.profitJpy > 0;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      {/* ソース名 + 利益率 */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          {source}
        </span>
        <span
          className={`text-lg font-bold ${
            isProfit
              ? "text-[var(--accent-green)]"
              : "text-[var(--accent-red)]"
          }`}
        >
          {isProfit ? "+" : ""}
          {formatJpy(data.profitJpy)}
        </span>
      </div>

      {/* 内訳 */}
      <div className="space-y-1 text-xs text-[var(--text-secondary)]">
        <div className="flex justify-between">
          <span>海外相場 ({data.displayCurrency}→JPY)</span>
          <span>{formatJpy(data.overseasPriceJpy)}</span>
        </div>
        <div className="flex justify-between">
          <span>仕入れ (免税)</span>
          <span>-{formatJpy(taxFreePrice)}</span>
        </div>
        <div className="flex justify-between">
          <span>手数料</span>
          <span>-{formatJpy(data.platformFeeJpy)}</span>
        </div>
        <div className="flex justify-between">
          <span>送料</span>
          <span>-{formatJpy(data.shippingCostJpy)}</span>
        </div>
        <div className="mt-2 border-t border-[var(--border)] pt-2">
          <div className="flex justify-between font-medium text-[var(--text-primary)]">
            <span>利益率</span>
            <span
              className={
                isProfit
                  ? "text-[var(--accent-green)]"
                  : "text-[var(--accent-red)]"
              }
            >
              {data.profitMargin}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

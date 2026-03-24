"use client";

import { useState, useCallback } from "react";
import { BarcodeScanner } from "@/components/scanner/barcode-scanner";
import { ProfitCard } from "@/components/profit/profit-card";
import { LocalPriceForm } from "@/components/price/local-price-form";
import { CurrencyToggle } from "@/components/ui/currency-toggle";
import { useCurrency } from "@/hooks/use-currency";

type Product = {
  id: string;
  name: string;
  nameEn?: string;
  janCode: string;
  taxFreePrice?: number;
  imageUrl?: string;
};

type ProfitData = {
  profitJpy: number;
  profitMargin: number;
  overseasPriceJpy: number;
  platformFeeJpy: number;
  shippingCostJpy: number;
  displayCurrency: string;
};

type PriceResult = {
  source: string;
  price: number;
  currency: string;
  fromCache: boolean;
  profit?: ProfitData;
};

export default function Home() {
  const [product, setProduct] = useState<Product | null>(null);
  const [prices, setPrices] = useState<Record<string, PriceResult>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currency, cycle } = useCurrency();

  const handleScan = useCallback(async (janCode: string) => {
    setLoading(true);
    setError(null);
    setPrices({});

    try {
      // ステップ1: 自前DBから商品特定 (APIコスト0)
      const productRes = await fetch(`/api/products/${janCode}`);
      if (!productRes.ok) {
        const err = await productRes.json();
        setError(err.error ?? "商品が見つかりません");
        setProduct(null);
        return;
      }

      const { product: prod, prices: cachedPrices } = await productRes.json();
      setProduct(prod);

      // キャッシュ済み価格があればまず表示
      if (cachedPrices?.length) {
        const cached: Record<string, PriceResult> = {};
        for (const p of cachedPrices) {
          cached[p.source] = { ...p, fromCache: true };
        }
        setPrices(cached);
      }

      // ステップ2: キャッシュ優先で外部価格取得
      const priceRes = await fetch(
        `/api/prices/search?productId=${prod.id}`
      );
      if (priceRes.ok) {
        const { prices: fetchedPrices } = await priceRes.json();
        setPrices(fetchedPrices);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLocalPriceSubmit = useCallback(
    async (data: {
      price: number;
      currency: string;
      country: string;
      shopName?: string;
      note?: string;
    }) => {
      if (!product) return;
      await fetch("/api/prices/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, ...data }),
      });
    },
    [product]
  );

  return (
    <div className="space-y-6">
      {/* ヘッダー部 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          バーコードをスキャンして利益を計算
        </p>
        <CurrencyToggle currency={currency} onToggle={cycle} />
      </div>

      {/* スキャナー */}
      <BarcodeScanner onScan={handleScan} />

      {/* ローディング */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent-blue)] border-t-transparent" />
          <span className="ml-2 text-sm text-[var(--text-secondary)]">
            価格を取得中...
          </span>
        </div>
      )}

      {/* エラー */}
      {error && (
        <div className="rounded-xl border border-[var(--accent-red)]/30 bg-[var(--accent-red)]/10 p-4 text-sm text-[var(--accent-red)]">
          {error}
        </div>
      )}

      {/* 商品情報 */}
      {product && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="font-medium">{product.name}</h2>
          {product.nameEn && (
            <p className="text-xs text-[var(--text-secondary)]">
              {product.nameEn}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3 text-sm">
            <span className="text-[var(--text-secondary)]">JAN:</span>
            <code className="text-xs">{product.janCode}</code>
            {product.taxFreePrice && (
              <>
                <span className="text-[var(--text-secondary)]">免税:</span>
                <span className="font-medium text-[var(--accent-gold)]">
                  ¥{product.taxFreePrice.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* 利益カード */}
      {product &&
        Object.entries(prices).map(([source, data]) => {
          if (!data.profit) return null;
          return (
            <ProfitCard
              key={source}
              source={source}
              data={data.profit}
              taxFreePrice={product.taxFreePrice ?? 0}
            />
          );
        })}

      {/* 現地価格投稿フォーム */}
      {product && (
        <LocalPriceForm
          productId={product.id}
          onSubmit={handleLocalPriceSubmit}
        />
      )}
    </div>
  );
}

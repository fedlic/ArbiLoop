import { convertCurrency } from "./exchange-rate";

export type ProfitInput = {
  /** 日本での免税価格 (JPY) */
  taxFreePrice: number;
  /** 海外での販売価格 */
  overseasPrice: number;
  /** 海外価格の通貨 */
  overseasCurrency: string;
  /** プラットフォーム手数料率 (例: 0.10 = 10%) */
  platformFeeRate?: number;
  /** 送料 (JPY) */
  shippingCostJpy?: number;
};

export type ProfitResult = {
  /** 純利益 (JPY) */
  profitJpy: number;
  /** 利益率 (%) */
  profitMargin: number;
  /** 海外価格の円換算 */
  overseasPriceJpy: number;
  /** 手数料 (JPY) */
  platformFeeJpy: number;
  /** 送料 (JPY) */
  shippingCostJpy: number;
  /** 計算に使用した通貨 */
  displayCurrency: string;
};

// プラットフォーム別デフォルト手数料率
export const DEFAULT_FEE_RATES: Record<string, number> = {
  ebay: 0.13, // eBay最終価値手数料 ~13%
  sasom: 0.05, // SASOM ~5%
  shopee: 0.08, // Shopee ~8%
  lazada: 0.08, // Lazada ~8%
};

/**
 * 利益シミュレーション計算
 * (海外相場 - 日本免税価格 - 手数料 - 送料) = 純利益
 */
export async function calculateProfit(
  input: ProfitInput
): Promise<ProfitResult | null> {
  const {
    taxFreePrice,
    overseasPrice,
    overseasCurrency,
    platformFeeRate = 0.1,
    shippingCostJpy = 2000,
  } = input;

  // 海外価格を円換算
  const overseasPriceJpy = await convertCurrency(
    overseasPrice,
    overseasCurrency,
    "JPY"
  );
  if (overseasPriceJpy == null) return null;

  // 手数料 (海外売上に対して)
  const platformFeeJpy = Math.round(overseasPriceJpy * platformFeeRate);

  // 純利益 = 海外売上(円) - 仕入れ(免税) - 手数料 - 送料
  const profitJpy = Math.round(
    overseasPriceJpy - taxFreePrice - platformFeeJpy - shippingCostJpy
  );

  // 利益率 = 純利益 / 仕入れ価格
  const profitMargin =
    taxFreePrice > 0
      ? Math.round((profitJpy / taxFreePrice) * 100 * 10) / 10
      : 0;

  return {
    profitJpy,
    profitMargin,
    overseasPriceJpy: Math.round(overseasPriceJpy),
    platformFeeJpy,
    shippingCostJpy,
    displayCurrency: overseasCurrency,
  };
}

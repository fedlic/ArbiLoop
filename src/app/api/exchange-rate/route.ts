import { NextResponse } from "next/server";
import { getAllExchangeRates, refreshExchangeRates } from "@/lib/exchange-rate";

/**
 * GET /api/exchange-rate
 *
 * 為替レートを取得。DBに有効なデータがなければ外部APIから取得 (1日1回)。
 */
export async function GET() {
  let rates = await getAllExchangeRates();

  // データがない、または全て24h超過の場合のみ外部API
  const isStale =
    rates.length === 0 ||
    rates.every(
      (r) =>
        Date.now() - r.fetchedAt.getTime() >
        Number(process.env.EXCHANGE_RATE_CACHE_TTL_SECONDS ?? 86400) * 1000
    );

  if (isStale) {
    try {
      await refreshExchangeRates();
      rates = await getAllExchangeRates();
    } catch (error) {
      console.error("[ExchangeRate] Refresh failed:", error);
      if (rates.length === 0) {
        return NextResponse.json(
          { error: "為替レート取得に失敗しました" },
          { status: 500 }
        );
      }
      // 古いデータでもあれば返す
    }
  }

  return NextResponse.json({ rates });
}

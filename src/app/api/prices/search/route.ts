import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCachedPrice, setCachedPrice } from "@/lib/cache";
import { EbayPriceScraper } from "@/lib/scrapers/ebay";
import { SasomPriceScraper } from "@/lib/scrapers/sasom";
import { ShopeePriceScraper } from "@/lib/scrapers/shopee";

const scrapers = [
  new EbayPriceScraper(),
  new SasomPriceScraper(),
  new ShopeePriceScraper(),
];

/**
 * GET /api/prices/search?productId=xxx
 *
 * キャッシュ優先で外部価格を取得。
 * キャッシュが有効 (24h以内) なら外部APIを叩かない。
 */
export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const results: Record<string, unknown> = {};
  const searchQuery = product.nameEn ?? product.name;

  for (const scraper of scrapers) {
    // ステップ1: キャッシュ確認
    const cached = await getCachedPrice(productId, scraper.source);
    if (cached) {
      results[scraper.source] = {
        ...cached,
        fromCache: true,
      };
      continue;
    }

    // ステップ2: キャッシュなし → 外部API/スクレイピング
    try {
      const prices = await scraper.search(searchQuery);
      if (prices.length > 0) {
        const best = prices[0]; // 最安値
        await setCachedPrice({
          productId,
          source: scraper.source,
          price: best.price,
          currency: best.currency,
          url: best.url,
          rawData: prices,
        });
        results[scraper.source] = {
          ...best,
          fromCache: false,
        };
      }
    } catch (error) {
      console.error(`[${scraper.source}] Error:`, error);
      results[scraper.source] = { error: "取得失敗", source: scraper.source };
    }
  }

  return NextResponse.json({ productId, prices: results });
}

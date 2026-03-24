import type { ScrapedPrice, PriceScraper } from "./types";

/**
 * Shopee Thailand スクレイピング
 *
 * 本番環境ではPlaywrightを使用 (VPSサーバーサイドで実行)。
 *
 * ※ キャッシュは呼び出し側で管理 (24h TTL)
 */
export class ShopeePriceScraper implements PriceScraper {
  source = "shopee" as const;

  async search(query: string): Promise<ScrapedPrice[]> {
    // TODO: Playwright実装 (VPSサーバーサイド)
    //
    // 実装予定:
    // 1. Playwrightでshopee.co.thにアクセス
    // 2. 検索APIまたはページスクレイピング
    // 3. 価格・タイトル・URLをパース
    //
    // const browser = await chromium.launch({ headless: true });
    // const page = await browser.newPage();
    // await page.goto(`https://shopee.co.th/search?keyword=${encodeURIComponent(query)}`);
    // ...

    console.log(`[Shopee] Search stub called: "${query}"`);
    return [];
  }
}

import type { ScrapedPrice, PriceScraper } from "./types";

/**
 * SASOM (タイのトレカマーケット) スクレイピング
 *
 * 本番環境ではPlaywrightを使用 (VPSサーバーサイドで実行)。
 * 開発時はモックデータを返す。
 *
 * ※ キャッシュは呼び出し側で管理 (24h TTL)
 */
export class SasomPriceScraper implements PriceScraper {
  source = "sasom" as const;

  async search(query: string): Promise<ScrapedPrice[]> {
    // TODO: Playwright実装 (VPSサーバーサイド)
    //
    // 実装予定:
    // 1. Playwrightでsasom.comにアクセス
    // 2. 検索バーにクエリ入力
    // 3. 結果ページから価格・タイトル・URLをパース
    // 4. ScrapedPrice[] として返却
    //
    // const browser = await chromium.launch({ headless: true });
    // const page = await browser.newPage();
    // await page.goto(`https://sasom.com/search?q=${encodeURIComponent(query)}`);
    // ...

    console.log(`[SASOM] Search stub called: "${query}"`);
    return [];
  }
}

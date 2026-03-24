import type { ScrapedPrice, PriceScraper } from "./types";

/**
 * eBay API (Browse API) を使用した価格取得
 *
 * キャッシュロジックは呼び出し側 (API route) で処理。
 * ここでは純粋にeBay APIを叩いて結果を返す。
 */
export class EbayPriceScraper implements PriceScraper {
  source = "ebay" as const;

  private appId: string;

  constructor() {
    this.appId = process.env.EBAY_APP_ID ?? "";
  }

  async search(query: string): Promise<ScrapedPrice[]> {
    if (!this.appId) {
      console.warn("[eBay] EBAY_APP_ID not set, skipping");
      return [];
    }

    try {
      // eBay Browse API - search endpoint
      const url = new URL(
        "https://api.ebay.com/buy/browse/v1/item_summary/search"
      );
      url.searchParams.set("q", query);
      url.searchParams.set("limit", "5");
      url.searchParams.set("sort", "price");
      url.searchParams.set(
        "filter",
        "deliveryCountry:US,conditions:{NEW}"
      );

      const token = await this.getAccessToken();
      if (!token) return [];

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        },
      });

      if (!res.ok) {
        console.error(`[eBay] API error: ${res.status}`);
        return [];
      }

      const data = await res.json();
      const items = data.itemSummaries ?? [];

      return items.map(
        (item: {
          title: string;
          price: { value: string; currency: string };
          itemWebUrl: string;
          condition: string;
        }): ScrapedPrice => ({
          source: "ebay",
          title: item.title,
          price: parseFloat(item.price.value),
          currency: item.price.currency,
          url: item.itemWebUrl,
          condition: item.condition === "New" ? "new" : "used",
          fetchedAt: new Date(),
        })
      );
    } catch (error) {
      console.error("[eBay] Search failed:", error);
      return [];
    }
  }

  /**
   * eBay OAuth2 Client Credentials Grant
   */
  private async getAccessToken(): Promise<string | null> {
    const certId = process.env.EBAY_CERT_ID ?? "";
    if (!this.appId || !certId) return null;

    try {
      const credentials = Buffer.from(`${this.appId}:${certId}`).toString(
        "base64"
      );

      const res = await fetch(
        "https://api.ebay.com/identity/v1/oauth2/token",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
        }
      );

      if (!res.ok) return null;

      const data = await res.json();
      return data.access_token ?? null;
    } catch {
      return null;
    }
  }
}

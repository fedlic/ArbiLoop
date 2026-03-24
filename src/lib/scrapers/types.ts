export type ScrapedPrice = {
  source: string;
  price: number;
  currency: string;
  title: string;
  url: string;
  condition?: "new" | "used" | "unknown";
  fetchedAt: Date;
};

export interface PriceScraper {
  source: string;
  search(query: string): Promise<ScrapedPrice[]>;
}

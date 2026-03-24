import { prisma } from "./db";

const DEFAULT_TTL_SECONDS = Number(
  process.env.PRICE_CACHE_TTL_SECONDS ?? 86400
); // 24h

type PriceCacheInput = {
  productId: string;
  source: string;
  price: number;
  currency: string;
  url?: string;
  rawData?: unknown;
};

/**
 * キャッシュから価格を取得。有効期限内のデータがあればそれを返す。
 * なければ null を返し、呼び出し側が外部APIを叩く。
 */
export async function getCachedPrice(productId: string, source: string) {
  const cached = await prisma.priceCache.findFirst({
    where: {
      productId,
      source,
      expiresAt: { gt: new Date() },
    },
    orderBy: { fetchedAt: "desc" },
  });

  return cached;
}

/**
 * 複数ソースのキャッシュを一括取得
 */
export async function getCachedPrices(
  productId: string,
  sources?: string[]
) {
  const where: Record<string, unknown> = {
    productId,
    expiresAt: { gt: new Date() },
  };
  if (sources?.length) {
    where.source = { in: sources };
  }

  return prisma.priceCache.findMany({
    where,
    orderBy: { fetchedAt: "desc" },
  });
}

/**
 * 外部APIの結果をDBにキャッシュ。既存キャッシュがあれば上書き。
 */
export async function setCachedPrice(
  input: PriceCacheInput,
  ttlSeconds = DEFAULT_TTL_SECONDS
) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  // 同一 productId + source の既存キャッシュを削除してから挿入
  await prisma.priceCache.deleteMany({
    where: {
      productId: input.productId,
      source: input.source,
    },
  });

  return prisma.priceCache.create({
    data: {
      productId: input.productId,
      source: input.source,
      price: input.price,
      currency: input.currency,
      url: input.url ?? null,
      rawData: input.rawData ? JSON.parse(JSON.stringify(input.rawData)) : undefined,
      fetchedAt: new Date(),
      expiresAt,
    },
  });
}

/**
 * 特定ソースのキャッシュが有効かチェック
 */
export async function isCacheValid(
  productId: string,
  source: string
): Promise<boolean> {
  const count = await prisma.priceCache.count({
    where: {
      productId,
      source,
      expiresAt: { gt: new Date() },
    },
  });
  return count > 0;
}

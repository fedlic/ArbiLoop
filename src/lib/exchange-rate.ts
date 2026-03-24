import { prisma } from "./db";

const RATE_TTL_SECONDS = Number(
  process.env.EXCHANGE_RATE_CACHE_TTL_SECONDS ?? 86400
); // 24h

type RatePair = { base: string; target: string };

const DEFAULT_PAIRS: RatePair[] = [
  { base: "JPY", target: "USD" },
  { base: "JPY", target: "THB" },
  { base: "JPY", target: "PHP" },
];

/**
 * DBから為替レートを取得。24h以内に取得済みならそれを返す。
 */
export async function getExchangeRate(
  base: string,
  target: string
): Promise<number | null> {
  const rate = await prisma.exchangeRate.findUnique({
    where: { base_target: { base, target } },
  });

  if (!rate) return null;

  // 24h以上経過していたら null を返して再取得を促す
  const age = Date.now() - rate.fetchedAt.getTime();
  if (age > RATE_TTL_SECONDS * 1000) return null;

  return rate.rate;
}

/**
 * 全通貨ペアの為替レートを取得
 */
export async function getAllExchangeRates() {
  return prisma.exchangeRate.findMany();
}

/**
 * 外部APIから為替レートを取得してDBに保存 (1日1回バッチ)
 *
 * 無料API例: https://api.exchangerate-api.com/v4/latest/JPY
 */
export async function refreshExchangeRates(): Promise<void> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  // 無料枠のAPIを使用 (API KEY不要のフォールバックも用意)
  const url = apiKey
    ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/JPY`
    : `https://api.exchangerate-api.com/v4/latest/JPY`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Exchange rate API failed: ${res.status}`);
  }

  const data = await res.json();
  const rates: Record<string, number> =
    data.conversion_rates ?? data.rates ?? {};

  for (const pair of DEFAULT_PAIRS) {
    const rate = rates[pair.target];
    if (rate == null) continue;

    await prisma.exchangeRate.upsert({
      where: { base_target: { base: pair.base, target: pair.target } },
      update: { rate, fetchedAt: new Date() },
      create: { base: pair.base, target: pair.target, rate, fetchedAt: new Date() },
    });
  }
}

/**
 * 金額を通貨間で変換
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number | null> {
  if (from === to) return amount;

  // JPY → target
  if (from === "JPY") {
    const rate = await getExchangeRate("JPY", to);
    return rate ? amount * rate : null;
  }

  // source → JPY → target
  const toJpy = await getExchangeRate("JPY", from);
  if (!toJpy) return null;
  const jpyAmount = amount / toJpy;

  if (to === "JPY") return jpyAmount;

  const toTarget = await getExchangeRate("JPY", to);
  return toTarget ? jpyAmount * toTarget : null;
}

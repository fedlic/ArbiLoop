import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCachedPrices } from "@/lib/cache";

/**
 * GET /api/products/[jan]
 *
 * JANコードから商品情報 + キャッシュ済み価格を返す。
 * DBアクセスのみ。外部APIは叩かない。
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jan: string }> }
) {
  const { jan } = await params;

  const product = await prisma.product.findUnique({
    where: { janCode: jan },
  });

  if (!product) {
    return NextResponse.json(
      { error: "商品が見つかりません", janCode: jan },
      { status: 404 }
    );
  }

  // キャッシュ済み価格を取得 (外部APIは叩かない)
  const cachedPrices = await getCachedPrices(product.id);

  return NextResponse.json({
    product,
    prices: cachedPrices,
  });
}

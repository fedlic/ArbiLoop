import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/prices/local
 *
 * 現地価格の投稿（マニラ・バンコク遠征用）
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { productId, price, currency, country, shopName, note } = body;

  if (!productId || !price || !currency || !country) {
    return NextResponse.json(
      { error: "productId, price, currency, country are required" },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const localPrice = await prisma.localPrice.create({
    data: {
      productId,
      price: parseFloat(price),
      currency,
      country,
      shopName: shopName ?? null,
      note: note ?? null,
    },
  });

  return NextResponse.json(localPrice, { status: 201 });
}

/**
 * GET /api/prices/local?productId=xxx
 *
 * 商品の現地価格一覧を取得
 */
export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  const prices = await prisma.localPrice.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(prices);
}

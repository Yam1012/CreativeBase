import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/mypage/orders/[id]/review
 * オーダー完了後のレビュー投稿
 * body: { rating: 1-5, comment?: string }
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const { rating, comment } = await req.json();
  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: "評価は1〜5で入力してください" }, { status: 400 });
  }

  const order = await prisma.spotOrder.findFirst({
    where: { id, userId },
    include: { review: true },
  });
  if (!order) return NextResponse.json({ error: "オーダーが見つかりません" }, { status: 404 });
  if (order.status !== "completed") {
    return NextResponse.json({ error: "完了済オーダーのみレビュー可能です" }, { status: 400 });
  }
  if (order.review) {
    return NextResponse.json({ error: "既にレビュー済みです" }, { status: 400 });
  }

  await prisma.orderReview.create({
    data: {
      spotOrderId: id,
      userId,
      rating: ratingNum,
      comment: comment?.trim() || null,
    },
  });

  return NextResponse.json({ success: true });
}

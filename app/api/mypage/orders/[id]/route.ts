import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/mypage/orders/[id] — ユーザー向けオーダー詳細（LP情報含む）
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const order = await prisma.spotOrder.findFirst({
    where: { id, userId },
    include: {
      files: { select: { id: true, filename: true, createdAt: true } },
      lpGeneration: {
        select: {
          id: true,
          status: true,
          slug: true,
          metaTitle: true,
          metaDescription: true,
          affiliateCode: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          revisionNotes: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "オーダーが見つかりません" }, { status: 404 });
  }

  return NextResponse.json(order);
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/mypage/lp — ユーザーのLP一覧
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const lps = await prisma.lpGeneration.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      slug: true,
      metaTitle: true,
      affiliateCode: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      spotOrder: {
        select: { id: true, type: true, createdAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(lps);
}

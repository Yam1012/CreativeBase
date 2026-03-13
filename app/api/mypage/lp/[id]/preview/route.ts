import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/mypage/lp/[id]/preview — ユーザー向けLPプレビューデータ取得
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

  const lp = await prisma.lpGeneration.findFirst({
    where: { id, userId },
    select: {
      id: true,
      status: true,
      slug: true,
      metaTitle: true,
      metaDescription: true,
      generatedHtml: true,
      editedHtml: true,
      contentData: true,
      affiliateCode: true,
      revisionNotes: true,
      publishedAt: true,
      template: {
        select: {
          htmlBody: true,
          cssBody: true,
        },
      },
    },
  });

  if (!lp) {
    return NextResponse.json({ error: "LPが見つかりません" }, { status: 404 });
  }

  return NextResponse.json(lp);
}

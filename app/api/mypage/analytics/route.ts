import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/mypage/analytics — ユーザーのGA設定取得
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ga4Tag: true, uaTag: true },
  });

  return NextResponse.json(user || { ga4Tag: null, uaTag: null });
}

/**
 * PATCH /api/mypage/analytics — GA設定保存
 */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { ga4Tag, uaTag } = await req.json();

  // バリデーション
  if (ga4Tag && !/^G-[A-Z0-9]+$/i.test(ga4Tag.trim())) {
    return NextResponse.json({ error: "GA4タグの形式が正しくありません（例: G-XXXXXXXXXX）" }, { status: 400 });
  }
  if (uaTag && !/^UA-\d+-\d+$/i.test(uaTag.trim())) {
    return NextResponse.json({ error: "UAタグの形式が正しくありません（例: UA-XXXXXXXXXX-1）" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ga4Tag: ga4Tag?.trim() || null,
      uaTag: uaTag?.trim() || null,
    },
    select: { ga4Tag: true, uaTag: true },
  });

  return NextResponse.json(updated);
}

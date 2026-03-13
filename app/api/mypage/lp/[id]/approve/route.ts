import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

/**
 * POST /api/mypage/lp/[id]/approve — ユーザーがLPプレビューを承認
 * preview_ready → approved
 */
export async function POST(
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
  });

  if (!lp) {
    return NextResponse.json({ error: "LPが見つかりません" }, { status: 404 });
  }

  if (lp.status !== "preview_ready") {
    return NextResponse.json(
      { error: "承認できるステータスではありません（現在: " + lp.status + "）" },
      { status: 400 }
    );
  }

  const updated = await prisma.lpGeneration.update({
    where: { id },
    data: {
      status: "approved",
      approvedAt: new Date(),
      revisionNotes: null,
    },
  });

  // 承認完了メール（管理者宛にLP承認通知）
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });
  if (user?.email) {
    await sendEmail(userId, "lp_approved", {
      to: user.email,
      userName: user.name || "お客様",
      lpTitle: lp.metaTitle || "LP",
    });
  }

  return NextResponse.json({ success: true, status: updated.status });
}

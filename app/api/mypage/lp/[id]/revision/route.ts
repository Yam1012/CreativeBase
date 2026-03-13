import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

/**
 * POST /api/mypage/lp/[id]/revision — ユーザーが修正を依頼
 * preview_ready → revision
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const body = await req.json();
  const { notes } = body as { notes?: string };

  if (!notes || notes.trim().length === 0) {
    return NextResponse.json({ error: "修正内容を入力してください" }, { status: 400 });
  }

  const lp = await prisma.lpGeneration.findFirst({
    where: { id, userId },
  });

  if (!lp) {
    return NextResponse.json({ error: "LPが見つかりません" }, { status: 404 });
  }

  if (lp.status !== "preview_ready") {
    return NextResponse.json(
      { error: "修正依頼できるステータスではありません（現在: " + lp.status + "）" },
      { status: 400 }
    );
  }

  const updated = await prisma.lpGeneration.update({
    where: { id },
    data: {
      status: "revision",
      revisionNotes: notes.trim(),
    },
  });

  // 修正依頼メール（管理者宛）
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });
  // 管理者メールアドレスへ送信（環境変数またはデフォルト）
  const adminEmail = process.env.ADMIN_EMAIL || "admin@datanote.net";
  await sendEmail(userId, "lp_revision", {
    to: adminEmail,
    userName: user?.name || "お客様",
    lpTitle: lp.metaTitle || "LP",
    revisionNotes: notes.trim(),
  });

  return NextResponse.json({ success: true, status: updated.status });
}

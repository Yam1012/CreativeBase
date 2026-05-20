import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

/**
 * POST /api/mypage/orders/[id]/status
 * ユーザー操作: 承認 or 修正依頼
 *
 * body: { action: "approve" | "request_revision", revisionNotes?: string }
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const { action, revisionNotes } = await req.json();
  if (!["approve", "request_revision"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const order = await prisma.spotOrder.findFirst({
    where: { id, userId },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status !== "review_pending") {
    return NextResponse.json(
      { error: "確認待ち状態のオーダーのみ操作できます" },
      { status: 400 }
    );
  }

  if (action === "approve") {
    await prisma.spotOrder.update({
      where: { id },
      data: { status: "completed" },
    });

    // 自動でCommentに承認メッセージを追加
    await prisma.comment.create({
      data: {
        spotOrderId: id,
        userId,
        role: "user",
        message: "完成品を承認しました。ありがとうございました。",
      },
    });
  } else {
    // 修正依頼
    if (!revisionNotes || revisionNotes.trim().length === 0) {
      return NextResponse.json({ error: "修正内容を入力してください" }, { status: 400 });
    }
    await prisma.spotOrder.update({
      where: { id },
      data: { status: "revision_requested" },
    });

    // Commentに修正依頼を追加
    await prisma.comment.create({
      data: {
        spotOrderId: id,
        userId,
        role: "user",
        message: `【修正依頼】\n${revisionNotes}`,
      },
    });
  }

  // 管理者通知（注意：管理者を取得して通知。簡略化のため省略可能だが入れる）
  const admins = await prisma.user.findMany({ where: { role: "admin" }, take: 1 });
  if (admins[0]) {
    await sendEmail(admins[0].id, "info_changed", {
      to: admins[0].email,
      userName: admins[0].name,
      changedItem: action === "approve" ? "オーダー承認" : "修正依頼",
      date: new Date().toLocaleDateString("ja-JP"),
    });
  }

  return NextResponse.json({ success: true });
}

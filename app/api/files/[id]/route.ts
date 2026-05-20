import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";

/**
 * DELETE /api/files/[id]
 * ファイルを削除（ユーザー: 自分のオーダーのファイル / 管理者: 全て）
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const { id } = await params;
  const sessionUser = session.user as { id: string; role?: string };

  const file = await prisma.fileUpload.findUnique({
    where: { id },
    include: { spotOrder: { select: { userId: true, status: true } } },
  });
  if (!file) {
    return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 404 });
  }

  // 権限チェック
  if (sessionUser.role !== "admin") {
    // ユーザーは自分のオーダーのファイル、または未紐付けファイルのみ削除可
    if (file.spotOrder && file.spotOrder.userId !== sessionUser.id) {
      return NextResponse.json({ error: "削除権限がありません" }, { status: 403 });
    }
    // 制作中・完了済のオーダーのファイルは削除不可
    if (file.spotOrder && file.spotOrder.status === "completed") {
      return NextResponse.json({ error: "完了済オーダーのファイルは削除できません" }, { status: 400 });
    }
  }

  // Vercel Blob から削除（失敗してもDB削除は実行）
  try {
    if (file.path.startsWith("http") && process.env.BLOB_READ_WRITE_TOKEN) {
      await del(file.path);
    }
  } catch (err) {
    console.warn("Blob delete failed (continuing):", err);
  }

  // DB から削除
  await prisma.fileUpload.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

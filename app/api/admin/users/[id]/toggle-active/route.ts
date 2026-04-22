import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/users/[id]/toggle-active — ユーザーアカウントの有効/無効切替
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 401 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }
  if (user.role === "admin") {
    return NextResponse.json({ error: "管理者アカウントは無効化できません" }, { status: 400 });
  }

  // role が "cancelled" なら "user" へ（有効化）、それ以外は "cancelled" へ（無効化）
  const newRole = user.role === "cancelled" ? "user" : "cancelled";
  await prisma.user.update({
    where: { id },
    data: { role: newRole },
  });

  return NextResponse.json({ success: true, role: newRole });
}

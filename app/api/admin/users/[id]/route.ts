import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  if ((session.user as { role?: string }).role !== "admin") return null;
  return session;
}

/**
 * PATCH /api/admin/users/[id]
 * 管理者によるユーザー情報編集
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "権限がありません" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.name !== undefined) data.name = body.name;
  if (body.nameKana !== undefined) data.nameKana = body.nameKana || null;
  if (body.email !== undefined) {
    const existing = await prisma.user.findFirst({
      where: { email: body.email, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: "このメールアドレスはすでに使用されています" }, { status: 400 });
    }
    data.email = body.email;
  }
  if (body.phone !== undefined) data.phone = body.phone || null;
  if (body.address !== undefined) data.address = body.address || null;
  if (body.companyName !== undefined) data.companyName = body.companyName || null;
  if (body.chatworkId !== undefined) data.chatworkId = body.chatworkId || null;
  if (body.role !== undefined && ["user", "admin", "cancelled"].includes(body.role)) {
    data.role = body.role;
  }
  if (body.password) {
    if (body.password.length < 8) {
      return NextResponse.json({ error: "パスワードは8文字以上にしてください" }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(body.password, 12);
  }

  await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/admin/users/[id]
 * 管理者によるユーザー削除（関連レコードも一括削除）
 */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "権限がありません" }, { status: 401 });
  const { id } = await params;

  // 自分自身を削除しない
  const sessionUserId = (session.user as { id: string }).id;
  if (sessionUserId === id) {
    return NextResponse.json({ error: "自分自身を削除することはできません" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  if (user.role === "admin") {
    return NextResponse.json({ error: "管理者は削除できません（先にロールを変更してください）" }, { status: 400 });
  }

  // 関連レコードを順に削除（外部キー制約のため）
  // SpotOrderに紐づくFileUpload, Commentを先に削除
  const orders = await prisma.spotOrder.findMany({
    where: { userId: id },
    select: { id: true },
  });
  const orderIds = orders.map((o) => o.id);

  await prisma.fileUpload.deleteMany({ where: { spotOrderId: { in: orderIds } } });
  await prisma.comment.deleteMany({ where: { spotOrderId: { in: orderIds } } });
  await prisma.lpGeneration.deleteMany({ where: { userId: id } });
  await prisma.spotOrder.deleteMany({ where: { userId: id } });
  await prisma.monthlySelection.deleteMany({ where: { userId: id } });
  await prisma.contract.deleteMany({ where: { userId: id } });
  await prisma.payment.deleteMany({ where: { userId: id } });
  await prisma.inquiry.deleteMany({ where: { userId: id } });
  await prisma.emailLog.deleteMany({ where: { userId: id } });
  await prisma.passwordResetToken.deleteMany({ where: { userId: id } });
  await prisma.comment.deleteMany({ where: { userId: id } });
  await prisma.referralCommission.deleteMany({
    where: { OR: [{ referrerId: id }, { referredId: id }] },
  });
  await prisma.externalAffiliateLog.deleteMany({ where: { userId: id } });

  // 最後にUserを削除
  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

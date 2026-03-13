import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: テンプレート詳細
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const template = await prisma.lpTemplate.findUnique({
    where: { id },
    include: { _count: { select: { lpGenerations: true } } },
  });

  if (!template) {
    return NextResponse.json({ error: "テンプレートが見つかりません" }, { status: 404 });
  }

  return NextResponse.json(template);
}

// PATCH: テンプレート更新
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, description, htmlBody, cssBody, sections, isActive } = body;

  const existing = await prisma.lpTemplate.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "テンプレートが見つかりません" }, { status: 404 });
  }

  // 名前変更時の重複チェック
  if (name && name !== existing.name) {
    const dup = await prisma.lpTemplate.findUnique({ where: { name } });
    if (dup) {
      return NextResponse.json({ error: "同名のテンプレートが既に存在します" }, { status: 409 });
    }
  }

  const template = await prisma.lpTemplate.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(htmlBody !== undefined && { htmlBody }),
      ...(cssBody !== undefined && { cssBody }),
      ...(sections !== undefined && { sections }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(template);
}

// DELETE: テンプレート削除
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.lpTemplate.findUnique({
    where: { id },
    include: { _count: { select: { lpGenerations: true } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "テンプレートが見つかりません" }, { status: 404 });
  }

  // LP生成に使用されている場合は非アクティブ化のみ
  if (existing._count.lpGenerations > 0) {
    await prisma.lpTemplate.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ message: "使用中のため非アクティブ化しました" });
  }

  await prisma.lpTemplate.delete({ where: { id } });
  return NextResponse.json({ message: "削除しました" });
}

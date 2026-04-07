import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") return null;
  return session;
}

/**
 * PATCH /api/admin/options/[id] — オプション更新
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { name, description, price, periodType, periodDays, category, isActive, sortOrder } = await req.json();

  const option = await prisma.optionItem.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description: description || null }),
      ...(price !== undefined && { price }),
      ...(periodType !== undefined && { periodType }),
      ...(periodDays !== undefined && { periodDays: periodType === "limited" ? periodDays : null }),
      ...(category !== undefined && { category }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    },
  });
  return NextResponse.json(option);
}

/**
 * DELETE /api/admin/options/[id] — オプション削除
 */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await prisma.optionItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

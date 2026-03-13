import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: オーダー詳細取得（LP情報付き）
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const order = await prisma.spotOrder.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      files: true,
      lpGeneration: {
        select: {
          id: true,
          status: true,
          slug: true,
          metaTitle: true,
          templateId: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "オーダーが見つかりません" }, { status: 404 });
  }

  return NextResponse.json(order);
}

// PATCH: ステータス更新
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { status } = await req.json();
  const validStatuses = ["pending", "in_progress", "completed"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await prisma.spotOrder.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ success: true });
}

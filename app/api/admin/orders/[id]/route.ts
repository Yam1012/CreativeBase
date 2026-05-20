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
      user: {
        select: {
          id: true, name: true, nameKana: true, email: true, phone: true, address: true,
          companyName: true, chatworkId: true, role: true, referralCode: true,
          createdAt: true,
        },
      },
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

// PATCH: オーダー編集（ステータス・金額・備考・ラッシュ納期など）
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.status !== undefined) {
    const validStatuses = ["pending", "in_progress", "review_pending", "revision_requested", "completed"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.revisionNotes !== undefined) data.notes = body.revisionNotes;
  if (body.basePrice !== undefined) data.basePrice = Number(body.basePrice) || 0;
  if (body.extraMinutes !== undefined) data.extraMinutes = Number(body.extraMinutes) || 0;
  if (body.totalPrice !== undefined) data.totalPrice = Number(body.totalPrice) || 0;
  if (body.rushDelivery !== undefined) data.rushDelivery = Boolean(body.rushDelivery);
  if (body.notes !== undefined) data.notes = body.notes || null;
  if (body.purpose !== undefined) data.purpose = body.purpose || null;

  await prisma.spotOrder.update({
    where: { id },
    data,
  });

  return NextResponse.json({ success: true });
}

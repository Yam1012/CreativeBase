import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: 既存オーダーにファイルを紐付ける
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { id: string; role: string };
  const { id } = await params;

  const { fileIds } = await req.json();
  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    return NextResponse.json({ error: "fileIds が必要です" }, { status: 400 });
  }

  // オーダー存在チェック + 所有権確認
  const order = await prisma.spotOrder.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "admin" && order.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // pending状態のファイルをオーダーに紐付け
  const result = await prisma.fileUpload.updateMany({
    where: {
      id: { in: fileIds },
      spotOrderId: "pending",
    },
    data: { spotOrderId: id },
  });

  return NextResponse.json({ linked: result.count });
}

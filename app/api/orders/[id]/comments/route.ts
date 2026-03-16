import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: コメント一覧
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { id: string; role: string };
  const { id } = await params;

  // オーダー存在チェック + 所有権確認
  const order = await prisma.spotOrder.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "admin" && order.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comments = await prisma.comment.findMany({
    where: { spotOrderId: id },
    include: { user: { select: { name: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

// POST: コメント投稿
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { id: string; role: string };
  const { id } = await params;

  const { message } = await req.json();
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "メッセージを入力してください" }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: "メッセージは2000文字以内で入力してください" }, { status: 400 });
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

  const comment = await prisma.comment.create({
    data: {
      spotOrderId: id,
      userId: user.id,
      role: user.role,
      message: message.trim(),
    },
    include: { user: { select: { name: true, role: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}

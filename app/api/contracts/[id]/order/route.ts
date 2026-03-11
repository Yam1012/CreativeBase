import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: contractId } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  // 契約を取得
  const contract = await prisma.contract.findFirst({
    where: { id: contractId, userId, status: "active" },
    include: { course: true },
  });

  if (!contract) {
    return NextResponse.json({ error: "契約が見つかりません" }, { status: 404 });
  }

  // 年間クォータチェック
  const yearlyLimit = contract.course.maxCreationsPerMonth * 12;
  const usedCount = await prisma.spotOrder.count({
    where: {
      contractId,
      status: { not: "cancelled" },
    },
  });

  if (usedCount >= yearlyLimit) {
    return NextResponse.json(
      { error: "年間の制作枠を使い切りました" },
      { status: 400 }
    );
  }

  const { type, notes, fileIds } = await req.json();

  if (!type || !["video", "lp"].includes(type)) {
    return NextResponse.json({ error: "制作タイプを選択してください" }, { status: 400 });
  }

  // オーダー作成
  const order = await prisma.spotOrder.create({
    data: {
      userId,
      contractId,
      type,
      orderCategory: "contract",
      status: "pending",
      notes: notes || null,
      basePrice: 0,
      totalPrice: 0,
    },
  });

  // アップロード済みファイルを紐付け
  if (fileIds && Array.isArray(fileIds) && fileIds.length > 0) {
    await prisma.fileUpload.updateMany({
      where: {
        id: { in: fileIds },
        spotOrderId: "pending",
      },
      data: {
        spotOrderId: order.id,
      },
    });
  }

  // メール送信
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    await sendEmail(userId, "order_added", {
      to: user.email,
      userName: user.name,
      optionName: type === "video" ? "動画制作" : "LP制作",
      date: new Date().toLocaleDateString("ja-JP"),
    });
  }

  return NextResponse.json({
    success: true,
    orderId: order.id,
    remaining: yearlyLimit - usedCount - 1,
  });
}

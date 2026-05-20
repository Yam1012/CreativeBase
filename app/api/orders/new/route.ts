import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { type, purpose, rushDelivery, notes, fileIds, optionIds } = await req.json();

  // 選択されたオプションの情報を取得して notes に含める
  let optionsNote = "";
  let optionsTotal = 0;
  if (optionIds && Array.isArray(optionIds) && optionIds.length > 0) {
    const selectedOptions = await prisma.optionItem.findMany({
      where: { id: { in: optionIds }, isActive: true },
    });
    if (selectedOptions.length > 0) {
      optionsNote = "\n\n【選択オプション】\n" + selectedOptions.map(
        (o) => `・${o.name}（¥${o.price.toLocaleString()}）`
      ).join("\n");
      optionsTotal = selectedOptions.reduce((sum, o) => sum + o.price, 0);
    }
  }

  const combinedNotes = (notes || "") + optionsNote;

  const order = await prisma.spotOrder.create({
    data: {
      userId,
      type,
      purpose: purpose || null,
      orderCategory: "additional",
      rushDelivery: rushDelivery ?? false,
      notes: combinedNotes || null,
      basePrice: optionsTotal,
      totalPrice: optionsTotal,
      status: "pending",
    },
  });

  // アップロード済みファイルをオーダーに紐付け
  if (fileIds && Array.isArray(fileIds) && fileIds.length > 0) {
    await prisma.fileUpload.updateMany({
      where: { id: { in: fileIds }, spotOrderId: null },
      data: { spotOrderId: order.id },
    });
  }

  // LP制作 = Entryコース相当のため、動画制作1本を無料で自動追加
  let freeVideoOrderId: string | null = null;
  if (type === "lp") {
    const freeVideoOrder = await prisma.spotOrder.create({
      data: {
        userId,
        type: "video",
        purpose: purpose || null,
        orderCategory: "additional",
        rushDelivery: false,
        notes: "【自動追加】LP制作（Entryコース相当）に付随する無料動画制作1本",
        status: "pending",
        basePrice: 0,
        totalPrice: 0,
      },
    });
    freeVideoOrderId = freeVideoOrder.id;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    await sendEmail(userId, "order_added", {
      to: user.email,
      userName: user.name,
      optionName: type === "video" ? "動画制作" : "LP制作",
      date: new Date().toLocaleDateString("ja-JP"),
    });

    // LP制作の場合、無料動画追加の通知メールも送信
    if (type === "lp") {
      await sendEmail(userId, "order_added", {
        to: user.email,
        userName: user.name,
        optionName: "動画制作（LP制作特典・無料）",
        date: new Date().toLocaleDateString("ja-JP"),
      });
    }
  }

  return NextResponse.json({ success: true, orderId: order.id, freeVideoOrderId });
}

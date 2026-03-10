import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { type, rushDelivery, notes } = await req.json();

  const order = await prisma.spotOrder.create({
    data: {
      userId,
      type,
      orderCategory: "additional",
      rushDelivery: rushDelivery ?? false,
      notes,
      status: "pending",
    },
  });

  // LP制作＝Start Upコース相当のため、動画制作1本を無料で自動追加
  let freeVideoOrderId: string | null = null;
  if (type === "lp") {
    const freeVideoOrder = await prisma.spotOrder.create({
      data: {
        userId,
        type: "video",
        orderCategory: "additional",
        rushDelivery: false,
        notes: "LP制作に付随する無料動画制作（1本）",
        status: "pending",
        totalPrice: 0,
      },
    });
    freeVideoOrderId = freeVideoOrder.id;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    const optionName = type === "lp"
      ? "LP制作 + 無料動画制作1本"
      : "動画制作";
    await sendEmail(userId, "order_added", {
      to: user.email,
      userName: user.name,
      optionName,
      date: new Date().toLocaleDateString("ja-JP"),
    });
  }

  return NextResponse.json({ success: true, orderId: order.id, freeVideoOrderId });
}

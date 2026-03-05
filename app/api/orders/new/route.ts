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

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    await sendEmail(userId, "order_added", {
      to: user.email,
      userName: user.name,
      optionName: type === "video" ? "動画制作" : "LP制作",
      date: new Date().toLocaleDateString("ja-JP"),
    });
  }

  return NextResponse.json({ success: true, orderId: order.id });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { name, message } = await req.json();

  if (!name || !message) {
    return NextResponse.json({ error: "氏名とお問い合わせ内容は必須です" }, { status: 400 });
  }

  if (message.length > 1000) {
    return NextResponse.json({ error: "お問い合わせ内容は1000文字以内でお願いします" }, { status: 400 });
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      userId,
      name,
      message,
    },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    await sendEmail(userId, "inquiry_received", {
      to: user.email,
      userName: user.name,
      message,
      date: new Date().toLocaleDateString("ja-JP"),
    });
  }

  return NextResponse.json({ success: true, inquiryId: inquiry.id });
}

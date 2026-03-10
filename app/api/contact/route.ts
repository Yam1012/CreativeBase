import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { category, subject, message } = await req.json();

  if (!category || !subject || !message) {
    return NextResponse.json({ error: "すべての項目を入力してください" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });

  // 管理者へ通知メール送信
  const adminUsers = await prisma.user.findMany({ where: { role: "admin" } });
  for (const admin of adminUsers) {
    await sendEmail(admin.id, "account_created", {
      to: admin.email,
      userName: admin.name,
      date: new Date().toLocaleDateString("ja-JP"),
    });
  }

  // ユーザーへ受付確認メール送信
  await sendEmail(userId, "order_added", {
    to: user.email,
    userName: user.name,
    optionName: `お問い合わせ（${category}）`,
    date: new Date().toLocaleDateString("ja-JP"),
  });

  return NextResponse.json({ success: true });
}

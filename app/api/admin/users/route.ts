import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateRandomCode(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * POST /api/admin/users
 * 管理者によるユーザー新規追加（Stripe決済を経由しない直接登録）
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 401 });
  }

  const body = await req.json();
  const {
    name, nameKana, email, password, phone, address,
    companyName, chatworkId, role, courseId,
  } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "氏名・メール・パスワードは必須です" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "パスワードは8文字以上にしてください" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "このメールアドレスはすでに登録されています" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const newReferralCode = `REF_${generateRandomCode(8)}`;

  const user = await prisma.user.create({
    data: {
      name,
      nameKana: nameKana || null,
      email,
      passwordHash,
      phone: phone || null,
      address: address || null,
      companyName: companyName || null,
      chatworkId: chatworkId || null,
      role: role === "admin" ? "admin" : "user",
      referralCode: newReferralCode,
    },
  });

  // コース指定があれば契約を作成（Stripe連携なしの管理者付与）
  if (courseId) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (course) {
      const now = new Date();
      const nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      await prisma.contract.create({
        data: {
          userId: user.id,
          courseId: course.id,
          status: "active",
          startDate: now,
          nextBillingDate: nextBilling,
        },
      });
    }
  }

  return NextResponse.json({ success: true, userId: user.id });
}

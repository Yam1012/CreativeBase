import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { mockCreatePayment, mockCreateSubscription } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, nameKana, email, password, phone, address, courseId } = body;

    // バリデーション
    if (!name || !email || !password || !courseId) {
      return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
    }

    // 重複チェック
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "このメールアドレスはすでに登録されています" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "コースが見つかりません" }, { status: 400 });
    }

    // パスワードハッシュ化
    const passwordHash = await bcrypt.hash(password, 12);

    // ユーザー作成
    const user = await prisma.user.create({
      data: { name, nameKana, email, passwordHash, phone, address },
    });

    // 決済モック（初期費用 + 初月分）
    const totalAmount = course.initialFee + course.monthlyFee;
    const payment = await mockCreatePayment(totalAmount, `初期費用・初月分 - ${course.name}`);

    // 決済レコード
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: totalAmount,
        type: "initial",
        status: "completed",
        stripePaymentId: payment.paymentId,
        description: `初期設定費用 ¥${course.initialFee.toLocaleString()} + 初月分 ¥${course.monthlyFee.toLocaleString()}`,
      },
    });

    // サブスク契約モック（スポット以外）
    let stripeSubId: string | undefined;
    if (course.type === "subscription") {
      const sub = await mockCreateSubscription(user.id, course.id);
      stripeSubId = sub.subscriptionId;
    }

    // 契約作成
    const now = new Date();
    const nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    await prisma.contract.create({
      data: {
        userId: user.id,
        courseId: course.id,
        status: "active",
        startDate: now,
        nextBillingDate: nextBilling,
        stripeSubscriptionId: stripeSubId,
      },
    });

    // メール送信
    await sendEmail(user.id, "account_created", {
      to: email,
      userName: name,
      date: now.toLocaleDateString("ja-JP"),
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "登録処理に失敗しました" }, { status: 500 });
  }
}

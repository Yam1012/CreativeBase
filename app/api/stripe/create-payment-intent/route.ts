import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, isStripeReady, createInitialPaymentIntent } from "@/lib/stripe";

/**
 * POST /api/stripe/create-payment-intent
 * 新規登録/コース追加用のPaymentIntent作成
 * 認証なしで動作可能（新規登録のフロー）
 *
 * 入力: { email, name, courseId, mode: "register" | "add_contract" }
 */
export async function POST(req: NextRequest) {
  if (!isStripeReady() || !stripe) {
    return NextResponse.json(
      { error: "Stripeが未設定です。管理者にお問い合わせください。" },
      { status: 503 }
    );
  }

  const { email, name, courseId, mode, registerData } = await req.json();

  if (!courseId) {
    return NextResponse.json({ error: "コースIDが必要です" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "コースが見つかりません" }, { status: 404 });
  }
  if (!course.stripePriceId) {
    return NextResponse.json(
      { error: "このコースはStripe側で未設定です。管理者にStripeセットアップを依頼してください。" },
      { status: 400 }
    );
  }

  // 新規登録の場合は重複メールチェック
  if (mode === "register" && email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "このメールアドレスはすでに登録されています" },
        { status: 400 }
      );
    }
  }

  const totalAmount = course.initialFee + course.monthlyFee;

  // metadataには登録情報の主要部分を埋める（決済成功後にfinalizeで使う）
  const metadata: Record<string, string> = {
    mode: mode || "register",
    courseId: course.id,
    courseName: course.name,
    initialFee: String(course.initialFee),
    monthlyFee: String(course.monthlyFee),
  };
  if (email) metadata.email = email;
  if (name) metadata.name = name;
  if (registerData?.referredByCode) metadata.referredByCode = registerData.referredByCode;
  if (registerData?.externalAffId) metadata.externalAffId = registerData.externalAffId;
  if (registerData?.externalAffSource) metadata.externalAffSource = registerData.externalAffSource;

  const { clientSecret, paymentIntentId } = await createInitialPaymentIntent({
    amount: totalAmount,
    metadata,
    description: `初期費用 ¥${course.initialFee.toLocaleString()} + 初月分 ¥${course.monthlyFee.toLocaleString()} - ${course.name}`,
  });

  return NextResponse.json({
    clientSecret,
    paymentIntentId,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    amount: totalAmount,
  });
}

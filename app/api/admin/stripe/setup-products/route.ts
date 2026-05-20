import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, isStripeReady } from "@/lib/stripe";

/**
 * POST /api/admin/stripe/setup-products
 * DB上の全Course（subscription）に対応するStripe Product/Priceを作成
 * 既に作成済みの場合はスキップ（idempotent）
 */
export async function POST() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 401 });
  }

  if (!isStripeReady() || !stripe) {
    return NextResponse.json(
      { error: "Stripe APIキーが未設定です。環境変数 STRIPE_SECRET_KEY を確認してください。" },
      { status: 400 }
    );
  }

  const courses = await prisma.course.findMany({
    where: { type: "subscription", isActive: true },
  });

  const results: Array<{
    courseName: string;
    productId: string;
    priceId: string;
    initialPriceId: string;
    created: boolean;
  }> = [];

  for (const course of courses) {
    let productId = course.stripeProductId;
    let priceId = course.stripePriceId;
    let initialPriceId = course.stripeInitialPriceId;
    let created = false;

    // Product作成
    if (!productId) {
      const product = await stripe.products.create({
        name: `Creative Base ${course.name}`,
        description: `${course.name}コース（年${course.maxCreationsPerMonth * 12}本制作）`,
        metadata: { courseId: course.id, courseName: course.name },
      });
      productId = product.id;
      created = true;
    }

    // 月額Price作成
    if (!priceId) {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: course.monthlyFee,
        currency: "jpy",
        recurring: { interval: "month" },
        metadata: { courseId: course.id, type: "monthly" },
      });
      priceId = price.id;
      created = true;
    }

    // 初期費用Price（one-time）作成
    if (!initialPriceId && course.initialFee > 0) {
      const initialPrice = await stripe.prices.create({
        product: productId,
        unit_amount: course.initialFee,
        currency: "jpy",
        metadata: { courseId: course.id, type: "initial" },
      });
      initialPriceId = initialPrice.id;
      created = true;
    }

    // DB更新
    await prisma.course.update({
      where: { id: course.id },
      data: { stripeProductId: productId, stripePriceId: priceId, stripeInitialPriceId: initialPriceId },
    });

    results.push({
      courseName: course.name,
      productId,
      priceId: priceId || "",
      initialPriceId: initialPriceId || "",
      created,
    });
  }

  return NextResponse.json({ success: true, results });
}

/**
 * GET /api/admin/stripe/setup-products
 * 各Courseの現在のStripe Product/Price状態を取得
 */
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 401 });
  }

  const courses = await prisma.course.findMany({
    where: { type: "subscription" },
    select: {
      id: true,
      name: true,
      monthlyFee: true,
      initialFee: true,
      stripeProductId: true,
      stripePriceId: true,
      stripeInitialPriceId: true,
    },
  });

  return NextResponse.json({
    stripeConfigured: isStripeReady(),
    courses,
  });
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  stripe,
  isStripeReady,
  getOrCreateStripeCustomer,
  createStripeSubscription,
  retrievePaymentIntent,
} from "@/lib/stripe";

function generateRandomCode(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * POST /api/register/finalize
 * 決済成功後にUser/Contract/Paymentを作成、Subscription開始
 *
 * 入力: { paymentIntentId, registerData }
 *  registerData: { name, nameKana, email, password, phone, address }
 */
export async function POST(req: NextRequest) {
  try {
    if (!isStripeReady() || !stripe) {
      return NextResponse.json({ error: "Stripeが未設定です" }, { status: 503 });
    }

    const body = await req.json();
    const { paymentIntentId, registerData } = body;

    if (!paymentIntentId) {
      return NextResponse.json({ error: "paymentIntentIdが必要です" }, { status: 400 });
    }

    // 決済成功確認
    const intent = await retrievePaymentIntent(paymentIntentId);
    if (intent.status !== "succeeded") {
      return NextResponse.json(
        { error: `決済が完了していません (status: ${intent.status})` },
        { status: 400 }
      );
    }

    // 重複処理防止: 既に同じPaymentIntent IDでPaymentが作られていれば、対応するUserを返す
    const existingPayment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntentId },
    });
    if (existingPayment) {
      return NextResponse.json({ success: true, userId: existingPayment.userId, alreadyProcessed: true });
    }

    const meta = intent.metadata || {};
    const courseId = meta.courseId;
    if (!courseId) {
      return NextResponse.json({ error: "決済情報にコースIDがありません" }, { status: 400 });
    }
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || !course.stripePriceId) {
      return NextResponse.json({ error: "コースが見つかりません" }, { status: 404 });
    }

    const { name, nameKana, email, password, phone, address } = registerData || {};
    if (!name || !email || !password) {
      return NextResponse.json({ error: "登録情報が不足しています" }, { status: 400 });
    }

    // メール重複再チェック
    const existsUser = await prisma.user.findUnique({ where: { email } });
    if (existsUser) {
      return NextResponse.json(
        { error: "このメールアドレスはすでに登録されています" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // 紹介元コード検証
    const referredByCode = meta.referredByCode || "";
    let validReferredByCode: string | null = null;
    if (referredByCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referredByCode },
        select: { referralCode: true },
      });
      if (referrer) validReferredByCode = referrer.referralCode;
    }

    const newReferralCode = `REF_${generateRandomCode(8)}`;

    // 外部アフィリエイト
    const validAffSources = ["rentracks", "moshimo", "other"];
    const externalAffSource = meta.externalAffSource || null;
    const cleanAffSource =
      externalAffSource && validAffSources.includes(externalAffSource)
        ? externalAffSource
        : externalAffSource
        ? "other"
        : null;
    const externalAffId = meta.externalAffId || null;

    // User作成
    const user = await prisma.user.create({
      data: {
        name, nameKana, email, passwordHash, phone, address,
        referralCode: newReferralCode,
        referredByCode: validReferredByCode,
        externalAffId,
        externalAffSource: cleanAffSource,
      },
    });

    // Stripe Customer 作成（PaymentIntent成功時はカード情報を引き継ぐ必要があるためAttach）
    const customerId = await getOrCreateStripeCustomer(user.id);

    // PaymentIntentで使用された支払い方法をCustomerに紐付ける（サブスク用）
    if (intent.payment_method && typeof intent.payment_method === "string") {
      try {
        await stripe.paymentMethods.attach(intent.payment_method, { customer: customerId });
        await stripe.customers.update(customerId, {
          invoice_settings: { default_payment_method: intent.payment_method },
        });
      } catch (err) {
        console.warn("PaymentMethod attach failed:", err);
      }
    }

    // Payment レコード
    const totalAmount = intent.amount;
    const paymentRecord = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: totalAmount,
        type: "initial",
        status: "completed",
        stripePaymentId: paymentIntentId,
        description: `初期費用 + 初月分 - ${course.name}`,
      },
    });

    // Subscription 開始
    let stripeSubId: string | null = null;
    if (course.type === "subscription") {
      try {
        const sub = await createStripeSubscription(customerId, course.stripePriceId, {
          userId: user.id,
          courseId: course.id,
        });
        stripeSubId = sub.id;
      } catch (err) {
        console.error("Subscription create failed:", err);
      }
    }

    // Contract 作成
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

    // 外部アフィリエイトログ
    if (externalAffId && cleanAffSource) {
      await prisma.externalAffiliateLog.create({
        data: {
          userId: user.id,
          paymentId: paymentRecord.id,
          source: cleanAffSource,
          affiliateId: externalAffId,
          eventType: "registration",
          baseAmount: totalAmount,
          metadata: JSON.stringify({ courseName: course.name }),
        },
      });
    }

    // 紹介報酬
    if (validReferredByCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: validReferredByCode },
        select: { id: true },
      });
      if (referrer) {
        const commissionAmount = Math.floor(totalAmount * 0.17);
        await prisma.referralCommission.create({
          data: {
            referrerId: referrer.id,
            referredId: user.id,
            paymentId: paymentRecord.id,
            baseAmount: totalAmount,
            commissionRate: 17,
            commissionAmount,
            status: "pending",
          },
        });
      }
    }

    // メール送信
    await sendEmail(user.id, "account_created", {
      to: email,
      userName: name,
      date: now.toLocaleDateString("ja-JP"),
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Register finalize error:", error);
    return NextResponse.json({ error: "登録処理に失敗しました" }, { status: 500 });
  }
}

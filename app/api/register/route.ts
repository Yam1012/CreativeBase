import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { mockCreatePayment, mockCreateSubscription } from "@/lib/stripe";

function generateRandomCode(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, nameKana, email, password, phone, address, courseId, referredByCode,
      externalAffId, externalAffSource, externalAffClickedAt,
    } = body;

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

    // 紹介元のコード検証（存在確認）
    let validReferredByCode: string | null = null;
    if (referredByCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referredByCode },
        select: { id: true, referralCode: true },
      });
      if (referrer) {
        validReferredByCode = referrer.referralCode;
      }
    }

    // ユーザーの紹介コード自動生成（REF_ + 8桁英数字）
    const newReferralCode = `REF_${generateRandomCode(8)}`;

    // 外部アフィリエイト情報のバリデーション
    const validAffSources = ["rentracks", "moshimo", "other"];
    const cleanAffSource = externalAffSource && validAffSources.includes(externalAffSource)
      ? externalAffSource
      : externalAffSource ? "other" : null;

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        name, nameKana, email, passwordHash, phone, address,
        referralCode: newReferralCode,
        referredByCode: validReferredByCode,
        externalAffId: externalAffId || null,
        externalAffSource: cleanAffSource,
        externalAffClickedAt: externalAffClickedAt ? new Date(externalAffClickedAt) : null,
      },
    });

    // 決済モック（初期費用 + 初月分）
    const totalAmount = course.initialFee + course.monthlyFee;
    const payment = await mockCreatePayment(totalAmount, `初期費用・初月分 - ${course.name}`);

    // 決済レコード
    const paymentRecord = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: totalAmount,
        type: "initial",
        status: "completed",
        stripePaymentId: payment.paymentId,
        description: `初期設定費用 ¥${course.initialFee.toLocaleString()} + 初月分 ¥${course.monthlyFee.toLocaleString()}`,
      },
    });

    // 外部アフィリエイト経由ログを生成（初回決済時）
    if (externalAffId && cleanAffSource) {
      await prisma.externalAffiliateLog.create({
        data: {
          userId: user.id,
          paymentId: paymentRecord.id,
          source: cleanAffSource,
          affiliateId: externalAffId,
          eventType: "registration",
          baseAmount: totalAmount,
          metadata: JSON.stringify({
            clickedAt: externalAffClickedAt,
            courseName: course.name,
          }),
        },
      });
    }

    // 紹介報酬レコード生成（初回決済完了時、紹介元がいる場合のみ）
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

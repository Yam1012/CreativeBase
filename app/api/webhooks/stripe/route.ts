import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * POST /api/webhooks/stripe
 * Stripe からのイベント受信。署名検証必須。
 */
export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret || webhookSecret.includes("dummy")) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        // 未処理イベントはログのみ
        console.log(`Unhandled event type: ${event.type}`);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}

async function handlePaymentIntentSucceeded(intent: Stripe.PaymentIntent) {
  // finalize API で既にPayment作成済みのため、ここではログ確認のみ
  const existing = await prisma.payment.findFirst({
    where: { stripePaymentId: intent.id },
  });
  if (!existing) {
    console.warn(`PaymentIntent ${intent.id} succeeded but no Payment record found`);
  }
}

async function handlePaymentIntentFailed(intent: Stripe.PaymentIntent) {
  // 既存Payment があれば failed に更新
  const existing = await prisma.payment.findFirst({
    where: { stripePaymentId: intent.id },
  });
  if (existing) {
    await prisma.payment.update({
      where: { id: existing.id },
      data: { status: "failed" },
    });
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // 月次サブスク課金が成功 → Payment(type=monthly) 作成
  if (!invoice.customer || typeof invoice.customer !== "string") return;
  if (invoice.billing_reason !== "subscription_cycle" && invoice.billing_reason !== "subscription_update") return;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: invoice.customer },
    include: { contracts: { include: { course: true }, where: { status: "active" }, take: 1 } },
  });
  if (!user) return;

  // 既に同じInvoice IDで作成済みかチェック
  const existing = await prisma.payment.findFirst({
    where: { stripeInvoiceId: invoice.id },
  });
  if (existing) return;

  await prisma.payment.create({
    data: {
      userId: user.id,
      amount: invoice.amount_paid,
      type: invoice.billing_reason === "subscription_cycle" ? "monthly" : "initial",
      status: "completed",
      stripeInvoiceId: invoice.id,
      description: invoice.description || "月次課金",
    },
  });

  // 月次課金成功メール送信
  if (invoice.billing_reason === "subscription_cycle") {
    const courseName = user.contracts[0]?.course?.name || "";
    await sendEmail(user.id, "monthly_payment_succeeded", {
      to: user.email,
      userName: user.name,
      amount: invoice.amount_paid.toLocaleString(),
      courseName,
      date: new Date().toLocaleDateString("ja-JP"),
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.customer || typeof invoice.customer !== "string") return;
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: invoice.customer },
  });
  if (!user) return;

  // Payment レコードを failed で作成
  await prisma.payment.create({
    data: {
      userId: user.id,
      amount: invoice.amount_due,
      type: "monthly",
      status: "failed",
      stripeInvoiceId: invoice.id,
      description: "月次課金 - 失敗（カード期限切れ等の可能性）",
    },
  });

  // 失敗メール通知
  await sendEmail(user.id, "payment_failed", {
    to: user.email,
    userName: user.name,
    description: "月次課金",
    amount: invoice.amount_due.toLocaleString(),
    date: new Date().toLocaleDateString("ja-JP"),
  });
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  // コース変更等の検知
  const contract = await prisma.contract.findFirst({
    where: { stripeSubscriptionId: sub.id },
  });
  if (!contract) return;

  // ステータス同期
  if (sub.status === "canceled" || sub.status === "incomplete_expired") {
    await prisma.contract.update({
      where: { id: contract.id },
      data: { status: "cancelled", cancelledAt: new Date() },
    });
  }
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const contract = await prisma.contract.findFirst({
    where: { stripeSubscriptionId: sub.id },
  });
  if (!contract) return;

  if (contract.status !== "cancelled") {
    await prisma.contract.update({
      where: { id: contract.id },
      data: { status: "cancelled", cancelledAt: new Date(), endDate: new Date() },
    });
  }
}

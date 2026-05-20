/**
 * Stripe API クライアントとヘルパー関数群
 * テストモード/本番モードは環境変数 STRIPE_SECRET_KEY で自動切替（sk_test_ / sk_live_）
 */
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const isStripeConfigured =
  stripeSecretKey &&
  !stripeSecretKey.includes("dummy") &&
  (stripeSecretKey.startsWith("sk_test_") || stripeSecretKey.startsWith("sk_live_"));

export const stripe = isStripeConfigured
  ? new Stripe(stripeSecretKey, { apiVersion: "2026-02-25.clover" })
  : null;

export function isStripeReady(): boolean {
  return !!stripe;
}

/**
 * Userに紐づくStripe Customerを取得（なければ作成）
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  if (!stripe) throw new Error("Stripe is not configured");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    phone: user.phone || undefined,
    metadata: {
      userId: user.id,
      referralCode: user.referralCode || "",
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * 初期費用＋初月分のPaymentIntent作成（新規登録/コース追加用）
 */
export async function createInitialPaymentIntent(params: {
  amount: number;
  customerId?: string;
  metadata: Record<string, string>;
  description?: string;
}): Promise<{ clientSecret: string; paymentIntentId: string }> {
  if (!stripe) throw new Error("Stripe is not configured");

  const intent = await stripe.paymentIntents.create({
    amount: params.amount, // 円のまま（zero-decimal currency）
    currency: "jpy",
    customer: params.customerId,
    description: params.description,
    metadata: params.metadata,
    automatic_payment_methods: { enabled: true },
  });

  return {
    clientSecret: intent.client_secret!,
    paymentIntentId: intent.id,
  };
}

/**
 * Stripe Subscription を作成
 */
export async function createStripeSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
): Promise<Stripe.Subscription> {
  if (!stripe) throw new Error("Stripe is not configured");

  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
    metadata,
  });
}

/**
 * Subscription のプラン変更（差額はprorationで自動計算）
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  if (!stripe) throw new Error("Stripe is not configured");

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  if (!sub.items.data.length) throw new Error("Subscription has no items");

  return stripe.subscriptions.update(subscriptionId, {
    items: [{ id: sub.items.data[0].id, price: newPriceId }],
    proration_behavior: "create_prorations",
  });
}

/**
 * Subscription 解約
 * prorate: true なら期末でなく即時解約して残期間を返金（credit）
 */
export async function cancelStripeSubscription(
  subscriptionId: string,
  options?: { immediately?: boolean }
): Promise<Stripe.Subscription> {
  if (!stripe) throw new Error("Stripe is not configured");

  if (options?.immediately) {
    return stripe.subscriptions.cancel(subscriptionId, {
      prorate: true,
      invoice_now: true,
    });
  }
  // 期末解約（デフォルト）
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * PaymentIntent をIDで取得
 */
export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  if (!stripe) throw new Error("Stripe is not configured");
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * 日割り残金計算（Stripe側のproration計算と併用する手動フォールバック）
 */
export function calcProrationRefund(
  monthlyFee: number,
  cancelDate: Date,
  periodEndDate: Date
): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const remainDays = Math.max(
    0,
    Math.ceil((periodEndDate.getTime() - cancelDate.getTime()) / msPerDay)
  );
  const daysInMonth = new Date(
    cancelDate.getFullYear(),
    cancelDate.getMonth() + 1,
    0
  ).getDate();
  return Math.floor((monthlyFee / daysInMonth) * remainDays);
}

// ===== 後方互換: モック関数 =====
// 既存コードを段階的に置き換えるため、Stripe未設定時はモックを返す
// 本番化後はこれらの関数を呼び出すコードを全て削除する

export interface MockPaymentResult {
  success: boolean;
  paymentId: string;
  amount: number;
  status: "completed" | "failed";
}

export async function mockCreatePayment(
  amount: number,
  description: string
): Promise<MockPaymentResult> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    success: true,
    paymentId: `mock_pi_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    amount,
    status: "completed",
  };
}

export async function mockCreateSubscription(
  _userId: string,
  _courseId: string
): Promise<{ subscriptionId: string; status: string }> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    subscriptionId: `mock_sub_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    status: "active",
  };
}

export async function mockCancelSubscription(
  _subscriptionId: string
): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { success: true };
}

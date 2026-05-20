import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, isStripeReady } from "@/lib/stripe";

/**
 * GET /api/mypage/payments/[id]/receipt
 * Payment レコードに紐づくStripe領収書URL（hosted）を取得
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment || payment.userId !== userId) {
    return NextResponse.json({ error: "決済が見つかりません" }, { status: 404 });
  }
  if (!isStripeReady() || !stripe) {
    return NextResponse.json({ error: "Stripeが未設定です" }, { status: 503 });
  }

  try {
    // Invoice ベース（サブスク課金）
    if (payment.stripeInvoiceId) {
      const invoice = await stripe.invoices.retrieve(payment.stripeInvoiceId);
      if (invoice.hosted_invoice_url) {
        return NextResponse.json({ url: invoice.hosted_invoice_url, type: "invoice" });
      }
      if (invoice.invoice_pdf) {
        return NextResponse.json({ url: invoice.invoice_pdf, type: "pdf" });
      }
    }

    // PaymentIntent ベース（初回決済）
    if (payment.stripePaymentId && !payment.stripePaymentId.startsWith("mock_")) {
      const intent = await stripe.paymentIntents.retrieve(payment.stripePaymentId, {
        expand: ["latest_charge"],
      });
      const charge = intent.latest_charge as { receipt_url?: string } | null;
      if (charge?.receipt_url) {
        return NextResponse.json({ url: charge.receipt_url, type: "receipt" });
      }
    }

    return NextResponse.json(
      { error: "この決済の領収書はまだ発行できません" },
      { status: 404 }
    );
  } catch (err) {
    console.error("Receipt retrieve error:", err);
    return NextResponse.json({ error: "領収書の取得に失敗しました" }, { status: 500 });
  }
}

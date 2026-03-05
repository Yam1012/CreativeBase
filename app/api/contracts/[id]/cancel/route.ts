import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mockCancelSubscription, calcProrationRefund } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const contract = await prisma.contract.findFirst({
    where: { id, userId, status: "active" },
    include: { course: true },
  });
  if (!contract) return NextResponse.json({ error: "契約が見つかりません" }, { status: 404 });

  const now = new Date();
  const refund = calcProrationRefund(
    contract.course.monthlyFee,
    now,
    contract.nextBillingDate
  );

  // Stripeキャンセル（モック）
  if (contract.stripeSubscriptionId) {
    await mockCancelSubscription(contract.stripeSubscriptionId);
  }

  // 返金レコード（日割り残金）
  if (refund > 0) {
    await prisma.payment.create({
      data: {
        userId,
        amount: refund,
        type: "refund",
        status: "completed",
        description: `解約返金（日割り）${contract.course.name}`,
      },
    });
  }

  // 契約ステータス更新
  await prisma.contract.update({
    where: { id },
    data: {
      status: "cancelled",
      cancelledAt: now,
      endDate: now,
    },
  });

  // メール送信
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    await sendEmail(userId, "course_cancelled", {
      to: user.email,
      userName: user.name,
      courseName: contract.course.name,
      date: now.toLocaleDateString("ja-JP"),
      endDate: now.toLocaleDateString("ja-JP"),
    });
  }

  return NextResponse.json({ success: true, refund });
}

// 残金プレビュー
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const contract = await prisma.contract.findFirst({
    where: { id, userId, status: "active" },
    include: { course: true },
  });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();
  const refund = calcProrationRefund(
    contract.course.monthlyFee,
    now,
    contract.nextBillingDate
  );

  return NextResponse.json({ refund, courseName: contract.course.name, monthlyFee: contract.course.monthlyFee });
}

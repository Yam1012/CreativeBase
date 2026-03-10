import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mockCancelSubscription, calcProrationRefund } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const contracts = await prisma.contract.findMany({
    where: { userId, status: "active" },
    include: { course: true },
  });

  const now = new Date();
  const contractDetails = contracts.map((c) => ({
    courseName: c.course.name,
    refund: calcProrationRefund(c.course.monthlyFee, now, c.nextBillingDate),
  }));

  return NextResponse.json({
    activeContracts: contracts.length,
    totalRefund: contractDetails.reduce((sum, c) => sum + c.refund, 0),
    contracts: contractDetails,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const contracts = await prisma.contract.findMany({
    where: { userId, status: "active" },
    include: { course: true },
  });

  const now = new Date();

  for (const contract of contracts) {
    const refund = calcProrationRefund(
      contract.course.monthlyFee,
      now,
      contract.nextBillingDate
    );

    if (contract.stripeSubscriptionId) {
      await mockCancelSubscription(contract.stripeSubscriptionId);
    }

    if (refund > 0) {
      await prisma.payment.create({
        data: {
          userId,
          amount: refund,
          type: "refund",
          status: "completed",
          description: `アカウント解約返金 ${contract.course.name}`,
        },
      });
    }

    await prisma.contract.update({
      where: { id: contract.id },
      data: { status: "cancelled", cancelledAt: now, endDate: now },
    });
  }

  // ユーザーをdeactivate（実際の削除は30日後を想定）
  await prisma.user.update({
    where: { id: userId },
    data: { role: "cancelled" },
  });

  // すべての解約処理が完了した後にメール送信
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    const deleteDate = new Date();
    deleteDate.setDate(deleteDate.getDate() + 30);

    await sendEmail(userId, "account_cancelled", {
      to: user.email,
      userName: user.name,
      date: now.toLocaleDateString("ja-JP"),
      deleteDate: deleteDate.toLocaleDateString("ja-JP"),
    });
  }

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mockCreatePayment, mockCreateSubscription } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { courseId } = await req.json();

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "コースが見つかりません" }, { status: 404 });

  // 決済モック（初期費用 + 初月分）
  const totalAmount = course.initialFee + course.monthlyFee;
  const payment = await mockCreatePayment(totalAmount, `コース追加: ${course.name}`);

  await prisma.payment.create({
    data: {
      userId,
      amount: totalAmount,
      type: "initial",
      status: "completed",
      stripePaymentId: payment.paymentId,
      description: `コース追加 ${course.name} 初期費用¥${course.initialFee.toLocaleString()} + 初月¥${course.monthlyFee.toLocaleString()}`,
    },
  });

  const sub = await mockCreateSubscription(userId, courseId);
  const now = new Date();
  const nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  await prisma.contract.create({
    data: {
      userId,
      courseId,
      status: "active",
      startDate: now,
      nextBillingDate: nextBilling,
      stripeSubscriptionId: sub.subscriptionId,
    },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    await sendEmail(userId, "course_added", {
      to: user.email,
      userName: user.name,
      courseName: course.name,
      date: now.toLocaleDateString("ja-JP"),
    });
  }

  return NextResponse.json({ success: true });
}

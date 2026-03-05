import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mockCreatePayment } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { newCourseId } = await req.json();

  const contract = await prisma.contract.findFirst({
    where: { id, userId, status: "active" },
    include: { course: true },
  });
  if (!contract) return NextResponse.json({ error: "契約が見つかりません" }, { status: 404 });

  const newCourse = await prisma.course.findUnique({ where: { id: newCourseId } });
  if (!newCourse) return NextResponse.json({ error: "コースが見つかりません" }, { status: 404 });

  // 差額計算（月割り）
  const diff = newCourse.monthlyFee - contract.course.monthlyFee;
  const fromName = contract.course.name;

  // 差額がある場合は決済
  if (diff > 0) {
    const payment = await mockCreatePayment(diff, `コース変更差額: ${fromName} → ${newCourse.name}`);
    await prisma.payment.create({
      data: {
        userId,
        amount: diff,
        type: "monthly",
        status: "completed",
        stripePaymentId: payment.paymentId,
        description: `コース変更差額 ${fromName} → ${newCourse.name}`,
      },
    });
  }

  // 契約更新
  const now = new Date();
  const nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  await prisma.contract.update({
    where: { id },
    data: {
      courseId: newCourseId,
      nextBillingDate: nextBilling,
    },
  });

  // メール送信
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    await sendEmail(userId, "course_changed", {
      to: user.email,
      userName: user.name,
      fromCourse: fromName,
      toCourse: newCourse.name,
      date: now.toLocaleDateString("ja-JP"),
    });
  }

  return NextResponse.json({ success: true });
}

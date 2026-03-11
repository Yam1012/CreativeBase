import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: contractId } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, userId },
    include: { course: true },
  });

  if (!contract) {
    return NextResponse.json({ error: "契約が見つかりません" }, { status: 404 });
  }

  const total = contract.course.maxCreationsPerMonth * 12;
  const used = await prisma.spotOrder.count({
    where: {
      contractId,
      status: { not: "cancelled" },
    },
  });
  const remaining = Math.max(0, total - used);

  return NextResponse.json({ total, used, remaining });
}

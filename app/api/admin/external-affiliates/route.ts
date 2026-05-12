import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/external-affiliates — 外部アフィリエイト履歴取得
 * クエリ: ?source=rentracks&period=month
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source"); // rentracks | moshimo | other | null=all
  const period = searchParams.get("period"); // month | last_month | all

  const where: Record<string, unknown> = {};
  if (source && source !== "all") where.source = source;

  if (period === "month") {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    where.createdAt = { gte: start };
  } else if (period === "last_month") {
    const start = new Date();
    start.setMonth(start.getMonth() - 1, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(1);
    end.setHours(0, 0, 0, 0);
    where.createdAt = { gte: start, lt: end };
  }

  const logs = await prisma.externalAffiliateLog.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(logs);
}

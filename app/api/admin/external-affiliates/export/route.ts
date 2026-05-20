import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/external-affiliates/export
 * 外部アフィリエイト履歴をCSVでエクスポート
 *
 * クエリパラメータ: source, period（month/last_month/all）
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source");
  const period = searchParams.get("period");

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
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  // CSV生成（UTF-8 BOM付きでExcel互換）
  const header = [
    "発生日時",
    "ASP",
    "アフィリエイトID",
    "イベント種別",
    "決済額（税別）",
    "ユーザーID",
    "ユーザー名",
    "メールアドレス",
    "通知ステータス",
    "通知日時",
    "通知エラー",
    "ログID",
    "決済ID",
  ];

  const escapeCsv = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replaceAll('"', '""')}"`;
    }
    return s;
  };

  const rows = logs.map((log) => [
    new Date(log.createdAt).toLocaleString("ja-JP", { dateStyle: "short", timeStyle: "medium" }),
    log.source,
    log.affiliateId,
    log.eventType,
    log.baseAmount,
    log.user.id,
    log.user.name,
    log.user.email,
    log.notificationStatus,
    log.notifiedAt ? new Date(log.notifiedAt).toLocaleString("ja-JP") : "",
    log.notificationError || "",
    log.id,
    log.paymentId || "",
  ]);

  const csv = "﻿" + [header, ...rows].map((r) => r.map(escapeCsv).join(",")).join("\n");

  const filename = `external-affiliates-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

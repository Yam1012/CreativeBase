import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") return null;
  return session;
}

/**
 * GET /api/admin/options — オプション一覧取得
 */
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const options = await prisma.optionItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(options);
}

/**
 * POST /api/admin/options — 新規オプション作成
 */
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, price, periodType, periodDays, category, sortOrder } = await req.json();

  if (!name || typeof price !== "number") {
    return NextResponse.json({ error: "オプション名と料金は必須です" }, { status: 400 });
  }

  const option = await prisma.optionItem.create({
    data: {
      name,
      description: description || null,
      price,
      periodType: periodType || "none",
      periodDays: periodType === "limited" ? (periodDays || null) : null,
      category: category || "general",
      sortOrder: sortOrder || 0,
    },
  });
  return NextResponse.json(option);
}

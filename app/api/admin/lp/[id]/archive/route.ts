import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: LPアーカイブ（published → archived）
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const lp = await prisma.lpGeneration.findUnique({ where: { id } });
  if (!lp) {
    return NextResponse.json({ error: "LP が見つかりません" }, { status: 404 });
  }

  if (lp.status !== "published") {
    return NextResponse.json({ error: "アーカイブできないステータスです" }, { status: 400 });
  }

  await prisma.lpGeneration.update({
    where: { id },
    data: {
      status: "archived",
      archivedAt: new Date(),
      publishedAt: null,
    },
  });

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH: LP編集内容保存
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { editedHtml, contentData, metaTitle, metaDescription } = body;

  const lp = await prisma.lpGeneration.findUnique({ where: { id } });
  if (!lp) {
    return NextResponse.json({ error: "LP が見つかりません" }, { status: 404 });
  }

  if (!["editing", "revision"].includes(lp.status)) {
    return NextResponse.json({ error: "編集不可のステータスです" }, { status: 400 });
  }

  const updated = await prisma.lpGeneration.update({
    where: { id },
    data: {
      ...(editedHtml !== undefined && { editedHtml }),
      ...(contentData !== undefined && { contentData }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription }),
    },
  });

  return NextResponse.json({ success: true, lp: updated });
}

// GET: LP詳細取得
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const lp = await prisma.lpGeneration.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      template: true,
      spotOrder: { select: { id: true, notes: true } },
    },
  });

  if (!lp) {
    return NextResponse.json({ error: "LP が見つかりません" }, { status: 404 });
  }

  return NextResponse.json(lp);
}

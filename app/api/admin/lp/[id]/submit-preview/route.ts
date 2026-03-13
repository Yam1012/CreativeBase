import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// POST: プレビュー提出（editing → preview_ready）
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

  if (!["editing", "revision"].includes(lp.status)) {
    return NextResponse.json({ error: "プレビュー提出できないステータスです" }, { status: 400 });
  }

  const updated = await prisma.lpGeneration.update({
    where: { id },
    data: { status: "preview_ready" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  // プレビュー準備完了メール（ユーザー宛）
  if (updated.user.email) {
    await sendEmail(updated.user.id, "lp_preview_ready", {
      to: updated.user.email,
      userName: updated.user.name || "お客様",
      lpTitle: updated.metaTitle || "LP",
    });
  }

  return NextResponse.json({ success: true });
}

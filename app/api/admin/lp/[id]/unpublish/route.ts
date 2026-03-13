import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// POST: LP非公開化（published → editing）
export async function POST(
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
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!lp) {
    return NextResponse.json({ error: "LP が見つかりません" }, { status: 404 });
  }

  if (lp.status !== "published") {
    return NextResponse.json({ error: "非公開にできないステータスです" }, { status: 400 });
  }

  await prisma.lpGeneration.update({
    where: { id },
    data: {
      status: "editing",
      publishedAt: null,
    },
  });

  // 非公開通知メール（ユーザー宛）
  if (lp.user.email) {
    await sendEmail(lp.user.id, "lp_unpublished", {
      to: lp.user.email,
      userName: lp.user.name || "お客様",
      lpTitle: lp.metaTitle || "LP",
    });
  }

  return NextResponse.json({ success: true });
}

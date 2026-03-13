import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// POST: LP公開（approved → published）
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

  if (!["approved", "editing"].includes(lp.status)) {
    return NextResponse.json({ error: "公開できないステータスです" }, { status: 400 });
  }

  await prisma.lpGeneration.update({
    where: { id },
    data: {
      status: "published",
      publishedAt: new Date(),
    },
  });

  // 公開完了メール（ユーザー宛）
  if (lp.user.email) {
    await sendEmail(lp.user.id, "lp_published", {
      to: lp.user.email,
      userName: lp.user.name || "お客様",
      lpTitle: lp.metaTitle || "LP",
      slug: lp.slug,
    });
  }

  return NextResponse.json({ success: true, slug: lp.slug });
}

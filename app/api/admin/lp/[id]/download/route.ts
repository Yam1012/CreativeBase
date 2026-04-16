import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderLpHtml, parseContentData } from "@/lib/lp-render";

/**
 * GET /api/admin/lp/[id]/download — 管理者向けLP HTMLダウンロード
 * 管理者はステータスに関わらずダウンロード可能（作業確認用）
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 401 });
  }
  const { id } = await params;

  const lp = await prisma.lpGeneration.findUnique({
    where: { id },
    include: {
      template: { select: { htmlBody: true, cssBody: true } },
      user: { select: { ga4Tag: true, uaTag: true } },
    },
  });

  if (!lp) {
    return NextResponse.json({ error: "LPが見つかりません" }, { status: 404 });
  }

  let html: string;
  if (lp.editedHtml) {
    html = lp.editedHtml;
  } else if (lp.template && lp.contentData) {
    const content = parseContentData(lp.contentData);
    html = renderLpHtml(lp.template.htmlBody, lp.template.cssBody, content, {
      affiliateCode: lp.affiliateCode || undefined,
      ga4Tag: lp.user?.ga4Tag || undefined,
      uaTag: lp.user?.uaTag || undefined,
      metaTitle: lp.metaTitle || undefined,
      metaDescription: lp.metaDescription || undefined,
    });
  } else {
    html = lp.generatedHtml || "<html><body><p>コンテンツがありません</p></body></html>";
  }

  const filename = `${lp.slug}.html`;
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderLpHtml, parseContentData } from "@/lib/lp-render";

const DOWNLOADABLE_STATUSES = ["preview_ready", "approved", "published"];

/**
 * GET /api/mypage/lp/[id]/download — ユーザー向けLP HTMLダウンロード
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const lp = await prisma.lpGeneration.findUnique({
    where: { id },
    include: {
      template: { select: { htmlBody: true, cssBody: true } },
      user: { select: { ga4Tag: true, uaTag: true } },
    },
  });

  if (!lp || lp.userId !== userId) {
    return NextResponse.json({ error: "LPが見つかりません" }, { status: 404 });
  }

  if (!DOWNLOADABLE_STATUSES.includes(lp.status)) {
    return NextResponse.json({ error: "このステータスではダウンロードできません" }, { status: 403 });
  }

  let html: string;
  if (lp.editedHtml) {
    html = lp.editedHtml;
  } else if (lp.template && lp.contentData) {
    const content = parseContentData(lp.contentData);
    html = renderLpHtml(lp.template.htmlBody, lp.template.cssBody, content, {
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

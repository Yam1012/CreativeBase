import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { renderLpHtml, parseContentData } from "@/lib/lp-render";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * 動的メタデータ生成
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const lp = await prisma.lpGeneration.findUnique({
    where: { slug },
    select: { metaTitle: true, metaDescription: true, status: true },
  });

  if (!lp || lp.status !== "published") {
    return { title: "ページが見つかりません" };
  }

  return {
    title: lp.metaTitle || "Creative Base LP",
    description: lp.metaDescription || undefined,
  };
}

/**
 * 公開LPページ — /lp/[slug]
 * 認証不要、公開ステータスのLPのみ表示
 */
export default async function PublicLpPage({ params }: Props) {
  const { slug } = await params;

  const lp = await prisma.lpGeneration.findUnique({
    where: { slug },
    include: {
      template: {
        select: { htmlBody: true, cssBody: true },
      },
    },
  });

  // 未公開またはアーカイブ
  if (!lp || lp.status !== "published") {
    notFound();
  }

  // HTMLコンテンツを生成
  let html: string;

  if (lp.editedHtml) {
    // 編集済みHTMLがあればそのまま使用
    html = lp.editedHtml;
  } else if (lp.template && lp.contentData) {
    // テンプレート + contentData からレンダリング
    const content = parseContentData(lp.contentData);
    html = renderLpHtml(
      lp.template.htmlBody,
      lp.template.cssBody,
      content,
      {
        affiliateCode: lp.affiliateCode || undefined,
        metaTitle: lp.metaTitle || undefined,
        metaDescription: lp.metaDescription || undefined,
      }
    );
  } else {
    html = lp.generatedHtml || "<p>コンテンツがありません</p>";
  }

  return (
    <div
      className="lp-public-page"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

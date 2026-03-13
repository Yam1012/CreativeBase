import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLpSlug } from "@/lib/affiliate";
import { renderLpHtml, parseTemplateSections } from "@/lib/lp-render";
import { generateLpContent } from "@/lib/ai";

// POST: LP生成トリガー（AI コンテンツ生成 → HTML レンダリング）
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { orderId, templateId } = body;

  if (!orderId || !templateId) {
    return NextResponse.json({ error: "orderId と templateId は必須です" }, { status: 400 });
  }

  // オーダー取得
  const order = await prisma.spotOrder.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, affiliateCode: true } },
      files: true,
      lpGeneration: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "オーダーが見つかりません" }, { status: 404 });
  }

  if (order.type !== "lp") {
    return NextResponse.json({ error: "LP制作オーダーではありません" }, { status: 400 });
  }

  // 既にLP生成済みの場合
  if (order.lpGeneration) {
    return NextResponse.json({ error: "既にLP生成が存在します", lpGenerationId: order.lpGeneration.id }, { status: 409 });
  }

  // テンプレート取得
  const template = await prisma.lpTemplate.findUnique({ where: { id: templateId } });
  if (!template) {
    return NextResponse.json({ error: "テンプレートが見つかりません" }, { status: 404 });
  }

  // テンプレートセクション定義をパース
  const sections = parseTemplateSections(template.sections);

  // AI コンテンツ生成（OPENAI_API_KEY がなければ自動でモック）
  const aiResult = await generateLpContent({
    sections,
    userNotes: order.notes || "",
    fileNames: order.files.map((f) => f.filename),
    templateName: template.name,
  });

  // テンプレートHTMLにコンテンツをマージ
  const generatedHtml = renderLpHtml(
    template.htmlBody,
    template.cssBody,
    aiResult.contentData,
    {
      affiliateCode: order.user.affiliateCode || undefined,
      metaTitle: aiResult.metaTitle,
      metaDescription: aiResult.metaDescription,
    }
  );

  // スラッグ生成
  const slug = generateLpSlug();

  // LpGeneration作成
  const lpGeneration = await prisma.lpGeneration.create({
    data: {
      spotOrderId: order.id,
      userId: order.user.id,
      templateId: template.id,
      status: "editing",
      slug,
      aiPrompt: aiResult.prompt,
      aiRawOutput: aiResult.rawOutput,
      generatedHtml,
      contentData: JSON.stringify(aiResult.contentData),
      affiliateCode: order.user.affiliateCode,
      metaTitle: aiResult.metaTitle,
      metaDescription: aiResult.metaDescription,
    },
  });

  // オーダーステータスを in_progress に
  await prisma.spotOrder.update({
    where: { id: orderId },
    data: { status: "in_progress" },
  });

  return NextResponse.json({
    success: true,
    lpGenerationId: lpGeneration.id,
    slug: lpGeneration.slug,
    isMock: aiResult.isMock,
  });
}

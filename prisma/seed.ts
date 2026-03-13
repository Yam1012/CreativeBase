import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // コースマスタ
  const courses = [
    {
      name: "Start Up",
      type: "subscription",
      monthlyFee: 10000,
      initialFee: 100000,
      maxCreationsPerMonth: 1,
      languages: 68,
    },
    {
      name: "Standard",
      type: "subscription",
      monthlyFee: 50000,
      initialFee: 100000,
      maxCreationsPerMonth: 2,
      languages: 68,
    },
    {
      name: "Enterprise",
      type: "subscription",
      monthlyFee: 100000,
      initialFee: 100000,
      maxCreationsPerMonth: 4,
      languages: 68,
    },
    {
      name: "スポット",
      type: "spot",
      monthlyFee: 0,
      initialFee: 100000,
      maxCreationsPerMonth: 0,
      languages: 68,
    },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { name: course.name },
      update: course,
      create: course,
    });
  }

  console.log("✅ Courses seeded");

  // 管理者ユーザー
  const adminPassword = await bcrypt.hash("admin1234", 12);
  await prisma.user.upsert({
    where: { email: "admin@datanote.net" },
    update: {},
    create: {
      email: "admin@datanote.net",
      passwordHash: adminPassword,
      name: "管理者",
      role: "admin",
    },
  });

  console.log("✅ Admin user seeded");
  console.log("   email: admin@datanote.net");
  console.log("   password: admin1234");

  // テストユーザー
  const testPassword = await bcrypt.hash("test1234", 12);
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      passwordHash: testPassword,
      name: "テスト太郎",
      nameKana: "テストタロウ",
      phone: "090-0000-0000",
      address: "東京都渋谷区テスト1-1-1",
    },
  });

  // テストユーザーの契約
  const startupCourse = await prisma.course.findFirst({
    where: { name: "Start Up" },
  });

  if (startupCourse) {
    const existingContract = await prisma.contract.findFirst({
      where: { userId: testUser.id },
    });

    if (!existingContract) {
      const now = new Date();
      await prisma.contract.create({
        data: {
          userId: testUser.id,
          courseId: startupCourse.id,
          status: "active",
          startDate: now,
          nextBillingDate: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
          stripeSubscriptionId: "mock_sub_test_startup",
        },
      });
    }
  }

  // テストユーザーにアフィリエイトコードを付与
  await prisma.user.update({
    where: { id: testUser.id },
    data: { affiliateCode: "cb_test1234" },
  });

  console.log("✅ Test user seeded");
  console.log("   email: test@example.com");
  console.log("   password: test1234");
  console.log("   affiliateCode: cb_test1234");

  // LP テンプレートシード
  const standardTemplate = await prisma.lpTemplate.upsert({
    where: { name: "Standard LP" },
    update: {},
    create: {
      name: "Standard LP",
      description: "汎用的なランディングページテンプレート（ヒーロー + 特徴3つ + CTA）",
      htmlBody: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{meta_title}}</title>
  <meta name="description" content="{{meta_description}}">
  <meta property="og:title" content="{{meta_title}}">
  <meta property="og:description" content="{{meta_description}}">
  <meta property="og:image" content="{{og_image}}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif; color: #1a1a2e; line-height: 1.7; }
    .hero { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: #fff; padding: 80px 20px; text-align: center; }
    .hero h1 { font-size: 2.5rem; margin-bottom: 16px; font-weight: 700; }
    .hero p { font-size: 1.2rem; opacity: 0.9; max-width: 600px; margin: 0 auto; }
    .features { padding: 60px 20px; max-width: 960px; margin: 0 auto; }
    .features h2 { text-align: center; font-size: 1.8rem; margin-bottom: 40px; }
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .feature-card { background: #f8fafc; border-radius: 12px; padding: 32px 24px; text-align: center; }
    .feature-card h3 { font-size: 1.2rem; margin-bottom: 12px; color: #0f172a; }
    .feature-card p { font-size: 0.95rem; color: #64748b; }
    .cta { background: #0f172a; color: #fff; padding: 60px 20px; text-align: center; }
    .cta h2 { font-size: 1.8rem; margin-bottom: 16px; }
    .cta p { margin-bottom: 24px; opacity: 0.9; }
    .cta-button { display: inline-block; background: #2563eb; color: #fff; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-size: 1.1rem; font-weight: 600; transition: background 0.2s; }
    .cta-button:hover { background: #1d4ed8; }
    .footer { padding: 40px 20px; text-align: center; color: #94a3b8; font-size: 0.85rem; }
  </style>
  {{tracking_script}}
</head>
<body>
  <section class="hero">
    <h1>{{hero_title}}</h1>
    <p>{{hero_subtitle}}</p>
  </section>
  <section class="features">
    <h2>特徴</h2>
    <div class="feature-grid">
      <div class="feature-card">
        <h3>特徴 1</h3>
        <p>{{feature_1}}</p>
      </div>
      <div class="feature-card">
        <h3>特徴 2</h3>
        <p>{{feature_2}}</p>
      </div>
      <div class="feature-card">
        <h3>特徴 3</h3>
        <p>{{feature_3}}</p>
      </div>
    </div>
  </section>
  <section class="cta">
    <h2>{{cta_text}}</h2>
    <p>{{body_text}}</p>
    <a href="{{cta_url}}" class="cta-button">お問い合わせ</a>
  </section>
  <footer class="footer">
    <p>{{footer_text}}</p>
    <p>&copy; {{current_year}} All Rights Reserved.</p>
  </footer>
</body>
</html>`,
      sections: JSON.stringify([
        { key: "hero_title", label: "ヒーロータイトル", type: "text", hint: "メインの見出し（5〜15文字）", required: true },
        { key: "hero_subtitle", label: "サブタイトル", type: "text", hint: "補足説明（20〜40文字）", required: true },
        { key: "feature_1", label: "特徴 1", type: "textarea", hint: "最初の特徴の説明文", required: true },
        { key: "feature_2", label: "特徴 2", type: "textarea", hint: "2番目の特徴の説明文", required: true },
        { key: "feature_3", label: "特徴 3", type: "textarea", hint: "3番目の特徴の説明文", required: true },
        { key: "body_text", label: "本文", type: "textarea", hint: "CTAセクションの説明文", required: false },
        { key: "cta_text", label: "CTAタイトル", type: "text", hint: "行動を促す見出し", required: true },
        { key: "cta_url", label: "CTA リンクURL", type: "text", hint: "ボタンのリンク先", required: false },
        { key: "footer_text", label: "フッターテキスト", type: "text", hint: "フッターの補足情報", required: false },
      ]),
      isActive: true,
    },
  });

  await prisma.lpTemplate.upsert({
    where: { name: "Review LP" },
    update: {},
    create: {
      name: "Review LP",
      description: "レビュー・口コミ重視のランディングページテンプレート",
      htmlBody: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{meta_title}}</title>
  <meta name="description" content="{{meta_description}}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif; color: #1a1a2e; line-height: 1.7; background: #f8fafc; }
    .hero { background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: #fff; padding: 80px 20px; text-align: center; }
    .hero h1 { font-size: 2.2rem; margin-bottom: 16px; }
    .hero p { font-size: 1.1rem; opacity: 0.9; }
    .reviews { padding: 60px 20px; max-width: 800px; margin: 0 auto; }
    .reviews h2 { text-align: center; margin-bottom: 32px; font-size: 1.6rem; }
    .review-card { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .review-card .name { font-weight: 600; margin-bottom: 8px; }
    .review-card .stars { color: #f59e0b; margin-bottom: 8px; }
    .review-card .text { color: #475569; font-size: 0.95rem; }
    .cta { padding: 60px 20px; text-align: center; }
    .cta-button { display: inline-block; background: #7c3aed; color: #fff; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-size: 1.1rem; font-weight: 600; }
    .footer { padding: 40px 20px; text-align: center; color: #94a3b8; font-size: 0.85rem; }
  </style>
  {{tracking_script}}
</head>
<body>
  <section class="hero">
    <h1>{{hero_title}}</h1>
    <p>{{hero_subtitle}}</p>
  </section>
  <section class="reviews">
    <h2>お客様の声</h2>
    <div class="review-card">
      <div class="stars">★★★★★</div>
      <div class="name">{{review_1_name}}</div>
      <div class="text">{{review_1_text}}</div>
    </div>
    <div class="review-card">
      <div class="stars">★★★★★</div>
      <div class="name">{{review_2_name}}</div>
      <div class="text">{{review_2_text}}</div>
    </div>
    <div class="review-card">
      <div class="stars">★★★★☆</div>
      <div class="name">{{review_3_name}}</div>
      <div class="text">{{review_3_text}}</div>
    </div>
  </section>
  <section class="cta">
    <h2>{{cta_text}}</h2>
    <p style="margin: 16px 0; color: #64748b;">{{body_text}}</p>
    <a href="{{cta_url}}" class="cta-button">今すぐ始める</a>
  </section>
  <footer class="footer">
    <p>{{footer_text}}</p>
    <p>&copy; {{current_year}} All Rights Reserved.</p>
  </footer>
</body>
</html>`,
      sections: JSON.stringify([
        { key: "hero_title", label: "ヒーロータイトル", type: "text", hint: "メインの見出し", required: true },
        { key: "hero_subtitle", label: "サブタイトル", type: "text", hint: "補足説明", required: true },
        { key: "review_1_name", label: "レビュー1 - 名前", type: "text", hint: "レビュアー名", required: true },
        { key: "review_1_text", label: "レビュー1 - 内容", type: "textarea", hint: "レビュー本文", required: true },
        { key: "review_2_name", label: "レビュー2 - 名前", type: "text", hint: "レビュアー名", required: true },
        { key: "review_2_text", label: "レビュー2 - 内容", type: "textarea", hint: "レビュー本文", required: true },
        { key: "review_3_name", label: "レビュー3 - 名前", type: "text", hint: "レビュアー名", required: true },
        { key: "review_3_text", label: "レビュー3 - 内容", type: "textarea", hint: "レビュー本文", required: true },
        { key: "body_text", label: "本文", type: "textarea", hint: "CTAセクションの説明文", required: false },
        { key: "cta_text", label: "CTAタイトル", type: "text", hint: "行動を促す見出し", required: true },
        { key: "cta_url", label: "CTA リンクURL", type: "text", hint: "ボタンのリンク先", required: false },
        { key: "footer_text", label: "フッターテキスト", type: "text", hint: "フッターの補足情報", required: false },
      ]),
      isActive: true,
    },
  });

  console.log("✅ LP Templates seeded (Standard LP, Review LP)");

  // サンプルLPオーダー + LpGeneration
  const existingLpOrder = await prisma.spotOrder.findFirst({
    where: { userId: testUser.id, type: "lp" },
  });

  if (!existingLpOrder) {
    const lpOrder = await prisma.spotOrder.create({
      data: {
        userId: testUser.id,
        type: "lp",
        orderCategory: "spot",
        status: "in_progress",
        notes: "商品紹介のLPを作成してほしい。ターゲットは30代女性。",
      },
    });

    await prisma.lpGeneration.create({
      data: {
        spotOrderId: lpOrder.id,
        userId: testUser.id,
        templateId: standardTemplate.id,
        status: "published",
        slug: "lp-sample-demo",
        affiliateCode: "cb_test1234",
        metaTitle: "サンプルLP - Creative Base",
        metaDescription: "Creative Baseで制作したサンプルランディングページです。",
        contentData: JSON.stringify({
          hero_title: "あなたのビジネスを加速する",
          hero_subtitle: "プロフェッショナルな動画制作で、ブランドの魅力を最大限に引き出します。",
          feature_1: "企画から制作まで一貫対応。お客様のビジョンを形にします。",
          feature_2: "68言語に対応したグローバル展開。世界中にメッセージを届けます。",
          feature_3: "最短3営業日で納品。スピーディーな制作フローを実現。",
          body_text: "まずは無料相談から始めましょう。専門スタッフが丁寧にヒアリングいたします。",
          cta_text: "今すぐ始めませんか？",
          cta_url: "https://example.com/contact",
          footer_text: "株式会社データノート - Creative Base",
        }),
        generatedHtml: "<html><body><h1>Sample LP</h1></body></html>",
        publishedAt: new Date(),
      },
    });

    console.log("✅ Sample LP Order + LpGeneration seeded (slug: lp-sample-demo)");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

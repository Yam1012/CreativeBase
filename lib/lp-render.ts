/**
 * LP テンプレートレンダリングユーティリティ
 * テンプレートHTML + セクション別コンテンツ → 最終HTML生成
 */

/**
 * テンプレートHTMLにコンテンツデータをマージして最終HTMLを生成
 */
export function renderLpHtml(
  templateHtml: string,
  templateCss: string | null,
  contentData: Record<string, string>,
  options?: {
    affiliateCode?: string;
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    publishedUrl?: string;
  }
): string {
  let html = templateHtml;

  // コンテンツプレースホルダーを置換
  for (const [key, value] of Object.entries(contentData)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }

  // システムプレースホルダーを置換
  if (options?.affiliateCode) {
    html = html.replaceAll("{{affiliate_code}}", options.affiliateCode);
  }
  if (options?.metaTitle) {
    html = html.replaceAll("{{meta_title}}", options.metaTitle);
  }
  if (options?.metaDescription) {
    html = html.replaceAll("{{meta_description}}", options.metaDescription);
  }
  if (options?.ogImage) {
    html = html.replaceAll("{{og_image}}", options.ogImage);
  }
  if (options?.publishedUrl) {
    html = html.replaceAll("{{published_url}}", options.publishedUrl);
  }
  html = html.replaceAll("{{current_year}}", new Date().getFullYear().toString());

  // アフィリエイトトラッキングスクリプトを注入
  if (options?.affiliateCode) {
    const trackingScript = generateTrackingScript(options.affiliateCode);
    html = html.replaceAll("{{tracking_script}}", trackingScript);
    // アウトバウンドリンクにrefパラメータを付与
    html = injectAffiliateLinks(html, options.affiliateCode);
  } else {
    html = html.replaceAll("{{tracking_script}}", "");
  }

  // CSSを注入
  if (templateCss) {
    html = html.replace("</head>", `<style>${templateCss}</style>\n</head>`);
  }

  // 未使用プレースホルダーをクリア
  html = html.replace(/\{\{[a-z_]+\}\}/g, "");

  return html;
}

/**
 * アフィリエイトトラッキングスクリプト生成
 * Cookie設定（30日間）+ ビーコン送信
 */
function generateTrackingScript(affiliateCode: string): string {
  return `
<script>
(function() {
  var ref = new URLSearchParams(window.location.search).get('ref') || '${affiliateCode}';
  if (ref) {
    document.cookie = 'cb_ref=' + ref + ';path=/;max-age=' + (30*24*60*60) + ';SameSite=Lax';
  }
})();
</script>`;
}

/**
 * HTMLのアウトバウンドリンクにrefパラメータを付与
 */
function injectAffiliateLinks(html: string, affiliateCode: string): string {
  // href属性を持つaタグにrefパラメータを追加
  return html.replace(
    /href="(https?:\/\/[^"]+)"/g,
    (match, url) => {
      try {
        const urlObj = new URL(url);
        if (!urlObj.searchParams.has("ref")) {
          urlObj.searchParams.set("ref", affiliateCode);
        }
        return `href="${urlObj.toString()}"`;
      } catch {
        return match;
      }
    }
  );
}

/**
 * テンプレートのsections JSONをパース
 */
export interface TemplateSection {
  key: string;
  label: string;
  type: "text" | "textarea" | "html" | "image";
  hint?: string;
  required?: boolean;
}

export function parseTemplateSections(sectionsJson: string): TemplateSection[] {
  try {
    return JSON.parse(sectionsJson) as TemplateSection[];
  } catch {
    return [];
  }
}

/**
 * テンプレートのセクション定義からモックコンテンツデータを生成（プレビュー用）
 */
export function generateMockContentData(sectionsJson: string): Record<string, string> {
  const sections = parseTemplateSections(sectionsJson);
  const mockData: Record<string, string> = {};

  const sampleTexts: Record<string, string> = {
    headline: "あなたのビジネスを加速させる",
    subheadline: "Creative Baseのプロフェッショナルなサービス",
    hero_text: "成功への第一歩を踏み出しましょう。私たちがお手伝いします。",
    cta_text: "今すぐ無料相談",
    cta_url: "#",
    feature_1: "高品質な動画制作",
    feature_2: "プロフェッショナルなLP制作",
    feature_3: "迅速な納品対応",
    description: "Creative Baseは、企業のマーケティング活動をサポートする総合クリエイティブサービスです。動画制作からLP制作まで、ワンストップでお任せください。",
    company_name: "株式会社サンプル",
    testimonial: "Creative Baseのおかげで、売上が150%アップしました。対応も迅速で、品質にも大変満足しています。",
    footer_text: "© 2026 Creative Base. All rights reserved.",
  };

  for (const section of sections) {
    if (sampleTexts[section.key]) {
      mockData[section.key] = sampleTexts[section.key];
    } else if (section.type === "image") {
      mockData[section.key] = "https://placehold.co/800x400/2563eb/ffffff?text=Sample+Image";
    } else if (section.type === "html") {
      mockData[section.key] = `<p>${section.label}のサンプルコンテンツ</p>`;
    } else {
      mockData[section.key] = `${section.label}のサンプルテキスト`;
    }
  }

  return mockData;
}

/**
 * contentData JSONをパース
 */
export function parseContentData(contentDataJson: string | null): Record<string, string> {
  if (!contentDataJson) return {};
  try {
    return JSON.parse(contentDataJson) as Record<string, string>;
  } catch {
    return {};
  }
}

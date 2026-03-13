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

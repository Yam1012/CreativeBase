/**
 * AI コンテンツ生成モジュール
 * 開発時はモック、本番時は OpenAI API を使用
 *
 * 環境変数:
 *   OPENAI_API_KEY — 設定時に実 AI を使用
 *   AI_MODEL      — 使用するモデル名（デフォルト: gpt-4o-mini）
 */

export interface AiGenerationRequest {
  /** テンプレートのセクション定義 */
  sections: { key: string; label: string; type: string; hint?: string }[];
  /** ユーザーの備考（オーダー時の入力） */
  userNotes: string;
  /** アップロードされたファイル名（参考情報） */
  fileNames: string[];
  /** テンプレート名 */
  templateName: string;
}

export interface AiGenerationResult {
  /** セクションキーごとの生成テキスト */
  contentData: Record<string, string>;
  /** メタタイトル */
  metaTitle: string;
  /** メタディスクリプション */
  metaDescription: string;
  /** AI の生の応答（デバッグ用） */
  rawOutput: string;
  /** AI プロンプト（ログ用） */
  prompt: string;
  /** モックかどうか */
  isMock: boolean;
}

/**
 * LP コンテンツを AI で生成
 */
export async function generateLpContent(
  request: AiGenerationRequest
): Promise<AiGenerationResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  // API キーがなければモック
  if (!apiKey) {
    return generateMockContent(request);
  }

  return generateWithOpenAI(apiKey, request);
}

// ─────────────────────────────────
// 実 AI 生成（OpenAI API）
// ─────────────────────────────────

async function generateWithOpenAI(
  apiKey: string,
  request: AiGenerationRequest
): Promise<AiGenerationResult> {
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  const sectionList = request.sections
    .map((s) => `- "${s.key}" (${s.label}): ${s.hint || s.type}`)
    .join("\n");

  const prompt = `あなたはランディングページのコピーライターです。
以下の情報をもとに、ランディングページの各セクションのテキストコンテンツを日本語で生成してください。

■テンプレート名: ${request.templateName}

■ユーザーからの要望:
${request.userNotes || "特になし"}

■参考ファイル:
${request.fileNames.length > 0 ? request.fileNames.join(", ") : "なし"}

■生成するセクション:
${sectionList}

■出力形式:
以下のJSON形式で出力してください。余分なテキストは含めないでください。
{
  "contentData": { "セクションkey": "テキスト", ... },
  "metaTitle": "ページタイトル（60文字以内）",
  "metaDescription": "ページ説明文（160文字以内）"
}

■注意:
- 各セクションは自然で魅力的な日本語にしてください
- CTAは行動を促す文言にしてください
- URLが必要な箇所は "https://example.com/contact" を使用してください
- HTMLタグは含めず、プレーンテキストで出力してください`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "あなたはプロフェッショナルなLPコピーライターです。指定されたJSON形式でのみ回答してください。" },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", response.status, errorData);
      // フォールバック: モック生成
      console.warn("AI生成に失敗したため、モックコンテンツにフォールバックします");
      return generateMockContent(request);
    }

    const data = await response.json();
    const rawOutput = data.choices?.[0]?.message?.content || "{}";

    let parsed: { contentData?: Record<string, string>; metaTitle?: string; metaDescription?: string };
    try {
      parsed = JSON.parse(rawOutput);
    } catch {
      console.error("AI output parse error:", rawOutput);
      return generateMockContent(request);
    }

    // セクション定義に基づいてコンテンツを検証・補完
    const contentData: Record<string, string> = {};
    for (const section of request.sections) {
      contentData[section.key] =
        parsed.contentData?.[section.key] || `[${section.label}のテキスト]`;
    }

    return {
      contentData,
      metaTitle: parsed.metaTitle || "Creative Base LP",
      metaDescription: parsed.metaDescription || "Creative Baseで制作したランディングページです。",
      rawOutput,
      prompt,
      isMock: false,
    };
  } catch (error) {
    console.error("OpenAI API call failed:", error);
    return generateMockContent(request);
  }
}

// ─────────────────────────────────
// モック AI 生成
// ─────────────────────────────────

async function generateMockContent(
  request: AiGenerationRequest
): Promise<AiGenerationResult> {
  // 疑似遅延（AIっぽさの演出）
  await new Promise((resolve) => setTimeout(resolve, 800));

  const mockTexts: Record<string, string> = {
    hero_title: "あなたのビジネスを加速する",
    hero_subtitle: "プロフェッショナルなクリエイティブで、ブランドの魅力を最大限に引き出します。",
    feature_1: "企画から制作まで一貫対応。お客様のビジョンを形にします。",
    feature_2: "68言語に対応したグローバル展開。世界中にメッセージを届けます。",
    feature_3: "最短3営業日で納品。スピーディーな制作フローを実現。",
    body_text: "まずは無料相談から始めましょう。専門スタッフが丁寧にヒアリングいたします。",
    cta_text: "今すぐ始めませんか？",
    cta_url: "https://example.com/contact",
    footer_text: "株式会社データノート - Creative Base",
    review_1_name: "田中 様",
    review_1_text: "期待以上のクオリティで大変満足しています。次回もぜひお願いしたいです。",
    review_2_name: "鈴木 様",
    review_2_text: "短納期にも関わらず、丁寧な対応をしていただきました。",
    review_3_name: "佐藤 様",
    review_3_text: "コストパフォーマンスが素晴らしい。社内評価も高いです。",
  };

  const contentData: Record<string, string> = {};
  for (const section of request.sections) {
    contentData[section.key] =
      mockTexts[section.key] || `[${section.label}のサンプルテキスト]`;
  }

  const prompt = `[モック] テンプレート: ${request.templateName}, 備考: ${request.userNotes || "なし"}`;

  return {
    contentData,
    metaTitle: "サンプルLP - Creative Base",
    metaDescription: "Creative Baseで制作したランディングページです。",
    rawOutput: JSON.stringify(contentData, null, 2),
    prompt,
    isMock: true,
  };
}

// ─────────────────────────────────
// テキスト抽出ユーティリティ
// ─────────────────────────────────

/**
 * ファイル名から素材テキストの要約を生成
 * Phase 6 拡張: pdf-parse や mammoth で実際のテキスト抽出が可能
 */
export function summarizeFileNames(fileNames: string[]): string {
  if (fileNames.length === 0) return "添付ファイルなし";
  return `添付ファイル: ${fileNames.join(", ")}`;
}

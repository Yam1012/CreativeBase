/**
 * メニュー写真の読み取り（Vision）
 *
 * 環境変数:
 *   OPENAI_API_KEY     — 設定時に実 AI で解析。未設定ならサンプルメニューを返す
 *   AI_VISION_MODEL    — 使用するモデル名（デフォルト: gpt-4o-mini）
 *
 * lib/ai.ts と同じく OpenAI Chat Completions を使う。
 * ただし「解析できなかったのに、それらしいメニューが出てくる」と誤解を招くため、
 * API 呼び出しが失敗した場合はモックにフォールバックせずエラーを投げる。
 */

import { DRINK_CATEGORIES, isDrinkCategory, type DrinkCategory } from "@/lib/nomu";

export interface ScannedItem {
  name: string;
  price: number | null;
  category: DrinkCategory;
}

export interface ScanResult {
  items: ScannedItem[];
  /** サンプルデータ（API キー未設定）かどうか */
  isMock: boolean;
}

/** 1 回の読み取りで扱う最大品目数（メニュー 1 枚として現実的な上限） */
const MAX_ITEMS = 60;

export class MenuScanError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "MenuScanError";
    this.status = status;
  }
}

const PROMPT = `あなたは居酒屋・レストランのメニュー写真を読み取るアシスタントです。
画像に写っているメニューの品目を、できるだけ漏れなく読み取ってください。

■ルール
- 品名は画像に書かれている表記のまま（サイズ違いは「生ビール（中）」のように分けて1件ずつ）
- price は数字のみ（例: 580）。「580円」「¥580」→ 580。税抜/税込の区別は気にしない
- 価格が読み取れない・書かれていない場合は price を null にする
- category は次のいずれか1つ: ${DRINK_CATEGORIES.join(" / ")}
- ドリンクを優先して読み取る。料理は category を「フード」にする
- 同じ品名が複数回出てきた場合は1件にまとめる
- 品目は最大${MAX_ITEMS}件まで
- メニューが写っていない場合は items を空配列にする

■出力形式（このJSONのみ、他のテキストは出力しない）
{"items":[{"name":"生ビール（中）","price":580,"category":"ビール"}]}`;

/**
 * data URL のメニュー画像から品目を抽出する
 */
export async function scanMenuImage(imageDataUrl: string): Promise<ScanResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { items: sampleMenu(), isMock: true };
  }

  const model = process.env.AI_VISION_MODEL || "gpt-4o-mini";

  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "あなたはメニュー写真を正確に読み取るOCRアシスタントです。指定されたJSON形式でのみ回答してください。",
          },
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: imageDataUrl, detail: "high" } },
            ],
          },
        ],
        temperature: 0,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      }),
    });
  } catch (error) {
    console.error("[nomu] vision request failed:", error);
    throw new MenuScanError("メニューの読み取りに失敗しました。通信環境を確認してもう一度お試しください。");
  }

  if (!response.ok) {
    const detail = await response.text();
    console.error("[nomu] OpenAI API error:", response.status, detail);
    throw new MenuScanError("メニューの読み取りに失敗しました。時間をおいてもう一度お試しください。");
  }

  const data = await response.json();
  const rawOutput: string = data.choices?.[0]?.message?.content || "{}";

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawOutput);
  } catch {
    console.error("[nomu] vision output parse error:", rawOutput);
    throw new MenuScanError("メニューの読み取り結果を解釈できませんでした。もう一度お試しください。");
  }

  return { items: normalizeItems(parsed), isMock: false };
}

/**
 * AI の出力を信用せず、型・値を整えてから返す
 */
function normalizeItems(parsed: unknown): ScannedItem[] {
  const rawItems = (parsed as { items?: unknown })?.items;
  if (!Array.isArray(rawItems)) return [];

  const seen = new Set<string>();
  const items: ScannedItem[] = [];

  for (const raw of rawItems) {
    if (!raw || typeof raw !== "object") continue;
    const record = raw as Record<string, unknown>;

    const name = typeof record.name === "string" ? record.name.trim().slice(0, 60) : "";
    if (!name) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    items.push({
      name,
      price: normalizePrice(record.price),
      category: isDrinkCategory(record.category) ? record.category : "その他",
    });

    if (items.length >= MAX_ITEMS) break;
  }

  return items;
}

function normalizePrice(value: unknown): number | null {
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.replace(/[^\d.]/g, ""))
        : NaN;
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.round(num);
}

/**
 * OPENAI_API_KEY 未設定時のサンプルメニュー（ローカル開発・デモ用）
 */
function sampleMenu(): ScannedItem[] {
  return [
    { name: "生ビール（中）", price: 580, category: "ビール" },
    { name: "生ビール（大）", price: 780, category: "ビール" },
    { name: "レモンサワー", price: 480, category: "サワー・チューハイ" },
    { name: "グレープフルーツサワー", price: 480, category: "サワー・チューハイ" },
    { name: "ハイボール", price: 500, category: "ハイボール・ウイスキー" },
    { name: "コークハイ", price: 520, category: "ハイボール・ウイスキー" },
    { name: "日本酒（冷酒）", price: 680, category: "日本酒" },
    { name: "芋焼酎ロック", price: 600, category: "焼酎" },
    { name: "グラスワイン（赤）", price: 620, category: "ワイン" },
    { name: "カシスオレンジ", price: 520, category: "カクテル" },
    { name: "ウーロン茶", price: 300, category: "ソフトドリンク" },
    { name: "コーラ", price: 300, category: "ソフトドリンク" },
    { name: "ノンアルコールビール", price: 450, category: "ソフトドリンク" },
    { name: "枝豆", price: 380, category: "フード" },
    { name: "唐揚げ", price: 580, category: "フード" },
  ];
}

import { NextRequest, NextResponse } from "next/server";
import { MenuScanError, scanMenuImage } from "@/lib/nomu-vision";

/**
 * リクエストボディの上限（data URL の文字列長 ≒ 元画像の約1.37倍）。
 * クライアント側で長辺1600pxに縮小して送るので通常は 1MB 未満に収まる。
 * Vercel のリクエストボディ上限(4.5MB)より手前で弾く。
 */
const MAX_IMAGE_CHARS = 4_000_000;

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: { image?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエストの形式が不正です" }, { status: 400 });
  }

  const image = body.image;
  if (typeof image !== "string" || !image.startsWith("data:image/")) {
    return NextResponse.json({ error: "メニュー画像を送信してください" }, { status: 400 });
  }

  if (image.length > MAX_IMAGE_CHARS) {
    return NextResponse.json(
      { error: "画像サイズが大きすぎます。もう一度撮り直してください。" },
      { status: 413 }
    );
  }

  try {
    const result = await scanMenuImage(image);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MenuScanError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[nomu] scan failed:", error);
    return NextResponse.json(
      { error: "メニューの読み取りに失敗しました。時間をおいてもう一度お試しください。" },
      { status: 500 }
    );
  }
}

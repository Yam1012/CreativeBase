import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import path from "path";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXTENSIONS = [
  ".pdf", ".doc", ".docx",
  ".mp4", ".mov", ".avi",
  ".ppt", ".pptx",
  ".xls", ".xlsx",
  ".jpg", ".jpeg", ".png",
];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "material"; // material | deliverable
    const spotOrderIdParam = formData.get("spotOrderId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "ファイルが選択されていません" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "ファイルサイズは50MB以下にしてください" }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `対応形式: ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400 }
      );
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "ファイルストレージが未設定です（BLOB_READ_WRITE_TOKEN）" },
        { status: 503 }
      );
    }

    // パス生成（ランダムサフィックス付与でファイル名衝突を回避）
    // ファイル名は拡張子のみを保持し、識別はBlob側のランダム接尾辞に任せる
    const userId = (session.user as { id: string }).id;
    const timestamp = Date.now();
    const pathname = `uploads/${userId}/${timestamp}${ext}`;

    let blob;
    try {
      blob = await put(pathname, file, {
        access: "public",
        addRandomSuffix: true,
      });
    } catch (blobError) {
      console.error("Vercel Blob put error:", blobError);
      const message = blobError instanceof Error ? blobError.message : String(blobError);
      return NextResponse.json(
        { error: `アップロードに失敗しました: ${message}` },
        { status: 500 }
      );
    }

    // DBにレコード作成
    // 管理者の完成品アップロード時は spotOrderId を即時紐付け、それ以外はnull（後で link-files で紐付け）
    const isAdmin = (session.user as { role?: string }).role === "admin";
    const cleanCategory = category === "deliverable" ? "deliverable" : "material";
    const fileRecord = await prisma.fileUpload.create({
      data: {
        spotOrderId: isAdmin && spotOrderIdParam ? spotOrderIdParam : null,
        filename: file.name,
        path: blob.url,
        uploadedBy: isAdmin ? "admin" : "user",
        category: cleanCategory,
      },
    });

    return NextResponse.json({
      fileId: fileRecord.id,
      filename: file.name,
      path: fileRecord.path,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `アップロード処理エラー: ${message}` },
      { status: 500 }
    );
  }
}

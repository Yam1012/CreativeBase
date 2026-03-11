import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
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

    if (!file) {
      return NextResponse.json({ error: "ファイルが選択されていません" }, { status: 400 });
    }

    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "ファイルサイズは50MB以下にしてください" }, { status: 400 });
    }

    // 拡張子チェック
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `対応形式: ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400 }
      );
    }

    // ファイル名にタイムスタンプ付与して保存
    const timestamp = Date.now();
    const safeName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9._\-\u3000-\u9fff]/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // ディレクトリが存在しない場合は作成
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, safeName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // DBにレコード作成（spotOrderIdは後で紐付け）
    const fileRecord = await prisma.fileUpload.create({
      data: {
        spotOrderId: "pending", // 仮ID、オーダー作成時に更新
        filename: file.name,
        path: `/uploads/${safeName}`,
        uploadedBy: "user",
      },
    });

    return NextResponse.json({
      fileId: fileRecord.id,
      filename: file.name,
      path: fileRecord.path,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
  }
}

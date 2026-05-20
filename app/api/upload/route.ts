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

    // Vercel Blob にアップロード
    const timestamp = Date.now();
    const userId = (session.user as { id: string }).id;
    const safeName = file.name.replace(/[^a-zA-Z0-9._\-　-鿿]/g, "_");
    const pathname = `uploads/${userId}/${timestamp}_${safeName}`;

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "ファイルストレージが未設定です（BLOB_READ_WRITE_TOKEN）" },
        { status: 503 }
      );
    }

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // DBにレコード作成（spotOrderIdは後で紐付け）
    const fileRecord = await prisma.fileUpload.create({
      data: {
        spotOrderId: "pending",
        filename: file.name,
        path: blob.url, // Vercel BlobのフルURL
        uploadedBy: (session.user as { role?: string }).role === "admin" ? "admin" : "user",
      },
    });

    return NextResponse.json({
      fileId: fileRecord.id,
      filename: file.name,
      path: fileRecord.path,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "アップロードに失敗しました。再度お試しください。" },
      { status: 500 }
    );
  }
}

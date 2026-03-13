import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: テンプレート一覧
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await prisma.lpTemplate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { lpGenerations: true } },
    },
  });

  return NextResponse.json(templates);
}

// POST: テンプレート新規作成
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, htmlBody, cssBody, sections } = body;

  if (!name || !htmlBody) {
    return NextResponse.json(
      { error: "テンプレート名とHTML本文は必須です" },
      { status: 400 }
    );
  }

  // 名前重複チェック
  const existing = await prisma.lpTemplate.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json(
      { error: "同名のテンプレートが既に存在します" },
      { status: 409 }
    );
  }

  const template = await prisma.lpTemplate.create({
    data: {
      name,
      description: description || null,
      htmlBody,
      cssBody: cssBody || null,
      sections: sections || "[]",
      isActive: true,
    },
  });

  return NextResponse.json(template, { status: 201 });
}

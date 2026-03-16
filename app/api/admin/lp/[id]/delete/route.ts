import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE: LP削除（公開中は不可）
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const lp = await prisma.lpGeneration.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!lp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (lp.status === "published") {
    return NextResponse.json(
      { error: "公開中のLPは削除できません。先に非公開にしてください。" },
      { status: 400 }
    );
  }

  // pending/reviewing/generating → 物理削除
  const hardDeleteStatuses = ["pending", "reviewing", "generating"];
  if (hardDeleteStatuses.includes(lp.status)) {
    await prisma.lpGeneration.delete({ where: { id } });
    return NextResponse.json({ message: "LPを削除しました" });
  }

  // それ以外 → アーカイブ（論理削除）
  await prisma.lpGeneration.update({
    where: { id },
    data: {
      status: "archived",
      archivedAt: new Date(),
    },
  });
  return NextResponse.json({ message: "LPをアーカイブしました" });
}

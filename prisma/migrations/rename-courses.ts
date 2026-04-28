/**
 * 既存DBのコース名をリネーム
 *   Start Up   → Entry
 *   Standard   → Start Up
 *   Enterprise → Standard
 *
 * 実行: npx tsx prisma/migrations/rename-courses.ts
 *
 * 注意: 一意制約があるため順序が重要
 *   1. Standard を temp 名へ退避
 *   2. Start Up → Entry
 *   3. temp → Start Up
 *   4. Enterprise → Standard
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 コース名のリネームを開始...");

  // Step 1: 「Standard」を一時退避（Start Upと衝突回避のため）
  const standard = await prisma.course.findUnique({ where: { name: "Standard" } });
  if (standard) {
    await prisma.course.update({
      where: { id: standard.id },
      data: { name: "__TMP_STANDARD__" },
    });
    console.log("  Standard → __TMP_STANDARD__（一時退避）");
  }

  // Step 2: 「Start Up」→「Entry」
  const startUp = await prisma.course.findUnique({ where: { name: "Start Up" } });
  if (startUp) {
    await prisma.course.update({
      where: { id: startUp.id },
      data: { name: "Entry" },
    });
    console.log("  Start Up → Entry");
  }

  // Step 3: 「__TMP_STANDARD__」→「Start Up」
  const tmp = await prisma.course.findUnique({ where: { name: "__TMP_STANDARD__" } });
  if (tmp) {
    await prisma.course.update({
      where: { id: tmp.id },
      data: { name: "Start Up" },
    });
    console.log("  __TMP_STANDARD__ → Start Up");
  }

  // Step 4: 「Enterprise」→「Standard」
  const enterprise = await prisma.course.findUnique({ where: { name: "Enterprise" } });
  if (enterprise) {
    await prisma.course.update({
      where: { id: enterprise.id },
      data: { name: "Standard" },
    });
    console.log("  Enterprise → Standard");
  }

  console.log("✅ コース名のリネーム完了");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

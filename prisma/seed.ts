import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // コースマスタ
  const courses = [
    {
      name: "Start Up",
      type: "subscription",
      monthlyFee: 10000,
      initialFee: 100000,
      maxCreationsPerMonth: 1,
      languages: 68,
    },
    {
      name: "Standard",
      type: "subscription",
      monthlyFee: 50000,
      initialFee: 100000,
      maxCreationsPerMonth: 2,
      languages: 68,
    },
    {
      name: "Enterprise",
      type: "subscription",
      monthlyFee: 100000,
      initialFee: 100000,
      maxCreationsPerMonth: 4,
      languages: 68,
    },
    {
      name: "スポット",
      type: "spot",
      monthlyFee: 0,
      initialFee: 100000,
      maxCreationsPerMonth: 0,
      languages: 68,
    },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { name: course.name },
      update: course,
      create: course,
    });
  }

  console.log("✅ Courses seeded");

  // 管理者ユーザー
  const adminPassword = await bcrypt.hash("admin1234", 12);
  await prisma.user.upsert({
    where: { email: "admin@datanote.net" },
    update: {},
    create: {
      email: "admin@datanote.net",
      passwordHash: adminPassword,
      name: "管理者",
      role: "admin",
    },
  });

  console.log("✅ Admin user seeded");
  console.log("   email: admin@datanote.net");
  console.log("   password: admin1234");

  // テストユーザー
  const testPassword = await bcrypt.hash("test1234", 12);
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      passwordHash: testPassword,
      name: "テスト太郎",
      nameKana: "テストタロウ",
      phone: "090-0000-0000",
      address: "東京都渋谷区テスト1-1-1",
    },
  });

  // テストユーザーの契約
  const startupCourse = await prisma.course.findFirst({
    where: { name: "Start Up" },
  });

  if (startupCourse) {
    const existingContract = await prisma.contract.findFirst({
      where: { userId: testUser.id },
    });

    if (!existingContract) {
      const now = new Date();
      await prisma.contract.create({
        data: {
          userId: testUser.id,
          courseId: startupCourse.id,
          status: "active",
          startDate: now,
          nextBillingDate: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
          stripeSubscriptionId: "mock_sub_test_startup",
        },
      });
    }
  }

  console.log("✅ Test user seeded");
  console.log("   email: test@example.com");
  console.log("   password: test1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

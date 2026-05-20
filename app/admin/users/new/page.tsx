import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NewUserForm } from "./new-user-form";

export default async function NewUserPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect("/login");
  }

  const courses = await prisma.course.findMany({
    where: { isActive: true, type: "subscription" },
    orderBy: { monthlyFee: "asc" },
    select: { id: true, name: true, monthlyFee: true },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/users"><ArrowLeft className="w-4 h-4 mr-1" />ユーザー一覧に戻る</Link>
        </Button>
        <h1 className="text-2xl font-bold mt-2">ユーザー新規追加</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Stripe決済を経由せず管理者が直接ユーザーを作成します（テスト用・特別契約用）
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <NewUserForm courses={courses} />
        </CardContent>
      </Card>
    </div>
  );
}

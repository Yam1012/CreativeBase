import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ProfileForm from "./profile-form";
import { AlertTriangle } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">アカウント設定</h1>
        <p className="text-gray-500 text-sm mt-0.5">契約者情報の確認・変更</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">契約者情報</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>

      <Separator />

      {/* アカウント解約 */}
      <Card className="border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            アカウント解約
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            アカウントを解約すると、すべての契約・データが削除されます。この操作は取り消せません。
          </p>
          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" asChild>
            <Link href="/mypage/account/cancel">アカウントを解約する</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

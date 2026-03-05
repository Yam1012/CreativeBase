import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  active: "契約中",
  cancelled: "解約済",
  pending: "処理中",
};
const STATUS_COLOR: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
};

export default async function ContractsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id: string }).id;

  const contracts = await prisma.contract.findMany({
    where: { userId },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">契約管理</h1>
          <p className="text-gray-500 text-sm mt-0.5">コースの確認・変更・解約ができます</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-500">
          <Link href="/mypage/contracts/add">
            <Plus className="w-4 h-4 mr-1" />
            コースを追加
          </Link>
        </Button>
      </div>

      {contracts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            <p>契約中のコースはありません</p>
            <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-500">
              <Link href="/mypage/contracts/add">コースに申し込む</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-3">
                    {contract.course.name}
                    <Badge className={STATUS_COLOR[contract.status]}>
                      {STATUS_LABEL[contract.status]}
                    </Badge>
                  </CardTitle>
                  {contract.status === "active" && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/mypage/contracts/${contract.id}`}>
                        管理 <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 text-xs">月額（税別）</div>
                  <div className="font-semibold">¥{contract.course.monthlyFee.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">月作成数</div>
                  <div className="font-semibold">{contract.course.maxCreationsPerMonth}本</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">契約開始日</div>
                  <div className="font-semibold">{new Date(contract.startDate).toLocaleDateString("ja-JP")}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">次回請求日</div>
                  <div className="font-semibold">
                    {contract.status === "active"
                      ? new Date(contract.nextBillingDate).toLocaleDateString("ja-JP")
                      : "—"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

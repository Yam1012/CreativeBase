import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowLeft } from "lucide-react";
import { ReceiptButton } from "./receipt-button";

const TYPE_LABELS: Record<string, string> = {
  initial: "初期費用＋初月分",
  monthly: "月額課金",
  spot: "スポット",
  refund: "返金",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  completed: { label: "完了", color: "bg-green-100 text-green-700" },
  pending: { label: "処理中", color: "bg-yellow-100 text-yellow-700" },
  failed: { label: "失敗", color: "bg-red-100 text-red-700" },
};

export default async function UserPaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id: string }).id;

  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const totalCompleted = payments
    .filter((p) => p.status === "completed" && p.type !== "refund")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalRefund = payments
    .filter((p) => p.status === "completed" && p.type === "refund")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/mypage"><ArrowLeft className="w-4 h-4 mr-1" />マイページに戻る</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6" /> 支払い履歴
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">これまでの決済・返金履歴を確認できます</p>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-gray-500">決済件数</div>
            <div className="text-2xl font-bold">{payments.length}<span className="text-sm font-normal ml-0.5">件</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-gray-500">累計お支払額</div>
            <div className="text-2xl font-bold">¥{totalCompleted.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-gray-500">返金額</div>
            <div className="text-2xl font-bold text-orange-600">¥{totalRefund.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* 履歴 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">明細</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>決済履歴はまだありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => {
                const s = STATUS_LABELS[p.status] || { label: p.status, color: "bg-gray-100" };
                const typeLabel = TYPE_LABELS[p.type] || p.type;
                const canReceipt =
                  p.status === "completed" &&
                  p.type !== "refund" &&
                  ((p.stripePaymentId && !p.stripePaymentId.startsWith("mock_")) || p.stripeInvoiceId);

                return (
                  <div key={p.id} className="border rounded-lg p-3 sm:p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{typeLabel}</span>
                          <Badge className={s.color}>{s.label}</Badge>
                          {p.type === "refund" && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">返金</Badge>
                          )}
                        </div>
                        {p.description && (
                          <p className="text-xs text-gray-500 mt-1">{p.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(p.createdAt).toLocaleString("ja-JP", {
                            dateStyle: "long",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-lg font-bold ${p.type === "refund" ? "text-orange-600" : ""}`}>
                          {p.type === "refund" ? "-" : ""}¥{p.amount.toLocaleString()}
                        </div>
                        {canReceipt && <ReceiptButton paymentId={p.id} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

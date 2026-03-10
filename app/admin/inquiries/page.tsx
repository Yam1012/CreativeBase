import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import InquiryActions from "./inquiry-actions";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  new: { label: "新規", color: "bg-red-100 text-red-700" },
  replied: { label: "対応済", color: "bg-blue-100 text-blue-700" },
  closed: { label: "完了", color: "bg-gray-100 text-gray-600" },
};

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const newCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">問い合わせ管理</h1>
        <p className="text-gray-500 text-sm mt-0.5">顧客からの問い合わせの確認・対応管理</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-gray-500">未対応</div>
            <div className="text-2xl font-bold text-red-600">{newCount}件</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-gray-500">対応済</div>
            <div className="text-2xl font-bold text-blue-600">
              {inquiries.filter((i) => i.status === "replied").length}件
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-gray-500">全件</div>
            <div className="text-2xl font-bold">{inquiries.length}件</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">問い合わせ一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {inquiries.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">問い合わせはまだありません</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ユーザー</TableHead>
                  <TableHead>氏名</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="w-[40%]">内容</TableHead>
                  <TableHead>受付日</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => {
                  const s = STATUS_MAP[inquiry.status] || { label: inquiry.status, color: "bg-gray-100 text-gray-600" };
                  return (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{inquiry.user.name}</div>
                        <div className="text-xs text-gray-500">{inquiry.user.email}</div>
                      </TableCell>
                      <TableCell className="text-sm">{inquiry.name}</TableCell>
                      <TableCell><Badge className={s.color}>{s.label}</Badge></TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">{inquiry.message}</p>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(inquiry.createdAt).toLocaleDateString("ja-JP")}
                      </TableCell>
                      <TableCell>
                        <InquiryActions inquiryId={inquiry.id} currentStatus={inquiry.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

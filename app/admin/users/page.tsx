import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      contracts: { include: { course: true }, where: { status: "active" } },
      _count: { select: { payments: true, spotOrders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ユーザー管理</h1>
        <p className="text-gray-500 text-sm mt-0.5">全ユーザーの一覧</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">ユーザー一覧（{users.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>氏名</TableHead>
                <TableHead>メール</TableHead>
                <TableHead>ロール</TableHead>
                <TableHead>契約コース</TableHead>
                <TableHead>決済数</TableHead>
                <TableHead>登録日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/users/${user.id}`} className="hover:underline text-blue-600">
                      {user.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={
                      user.role === "admin" ? "bg-purple-100 text-purple-700"
                        : user.role === "cancelled" ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }>
                      {user.role === "admin" ? "管理者" : user.role === "cancelled" ? "解約済" : "会員"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.contracts.length > 0
                      ? user.contracts.map((c) => c.course.name).join(", ")
                      : <span className="text-gray-400">なし</span>}
                  </TableCell>
                  <TableCell>{user._count.payments}件</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

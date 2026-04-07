import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OptionsManager } from "./options-manager";

export default async function AdminOptionsPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect("/login");
  }

  const options = await prisma.optionItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">オプション管理</h1>
        <p className="text-gray-500 text-sm mt-0.5">オーダー追加時に選択できるオプション項目を管理</p>
      </div>
      <OptionsManager initialOptions={options} />
    </div>
  );
}

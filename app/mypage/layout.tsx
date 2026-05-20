import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MypageNav from "@/components/mypage-nav";

export default async function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MypageNav user={session.user as { name?: string | null; email?: string | null; role?: string }} />
      <main className="max-w-5xl mx-auto px-4 py-6 w-full flex-1">{children}</main>
      <footer className="mt-8 border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-center gap-3 text-xs text-gray-500 flex-wrap">
          <Link href="/terms" className="hover:text-gray-700 hover:underline">利用規約</Link>
          <span>・</span>
          <Link href="/privacy" className="hover:text-gray-700 hover:underline">プライバシーポリシー</Link>
          <span>・</span>
          <Link href="/legal" className="hover:text-gray-700 hover:underline">特商法表記</Link>
          <span className="ml-2 text-gray-400">© 株式会社データノート</span>
        </div>
      </footer>
    </div>
  );
}

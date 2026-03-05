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
    <div className="min-h-screen bg-gray-50">
      <MypageNav user={session.user as { name?: string | null; email?: string | null; role?: string }} />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

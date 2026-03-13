"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  User,
  LogOut,
  Settings,
  MessageSquare,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavProps {
  user: { name?: string | null; email?: string | null; role?: string };
}

const navItems = [
  { href: "/mypage", label: "ダッシュボード", icon: LayoutDashboard, exact: true },
  { href: "/mypage/contracts", label: "契約管理", icon: FileText },
  { href: "/mypage/orders", label: "追加オーダー", icon: ShoppingBag },
  { href: "/mypage/lp", label: "マイLP", icon: Globe },
  { href: "/mypage/inquiry", label: "お問い合わせ", icon: MessageSquare },
  { href: "/mypage/profile", label: "アカウント設定", icon: User },
];

export default function MypageNav({ user }: NavProps) {
  const pathname = usePathname();

  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* ロゴ */}
          <Link href="/mypage" className="font-bold text-lg tracking-tight">
            Creative Base
          </Link>

          {/* ナビ */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors",
                    active
                      ? "bg-white/20 text-white"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-yellow-300 hover:text-yellow-200 hover:bg-white/10 transition-colors"
              >
                <Settings className="w-4 h-4" />
                管理者
              </Link>
            )}
          </nav>

          {/* ユーザー情報 + ログアウト */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300 hidden md:block">
              {user.name || user.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-white/10"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline ml-1">ログアウト</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

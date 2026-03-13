"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, FileText, ShoppingBag, CreditCard, MessageSquare, LogOut, Shield, Globe, Layout } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "ユーザー管理", icon: Users },
  { href: "/admin/contracts", label: "契約管理", icon: FileText },
  { href: "/admin/orders", label: "オーダー管理", icon: ShoppingBag },
  { href: "/admin/lp", label: "LP管理", icon: Globe },
  { href: "/admin/lp-templates", label: "テンプレート", icon: Layout },
  { href: "/admin/payments", label: "決済管理", icon: CreditCard },
  { href: "/admin/inquiries", label: "問い合わせ", icon: MessageSquare },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="bg-slate-800 text-white shadow-md border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            <Shield className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-lg whitespace-nowrap">管理画面</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5 mx-4 overflow-x-auto">
            {navItems.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-2 rounded-md text-sm whitespace-nowrap transition-colors",
                    active ? "bg-white/20 text-white" : "text-slate-300 hover:text-white hover:bg-white/10"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-white/10"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline ml-1">ログアウト</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

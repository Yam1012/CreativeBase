"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, FileText, ShoppingBag, CreditCard, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "アカウント管理", icon: Users },
  { href: "/admin/contracts", label: "プラン管理", icon: FileText },
  { href: "/admin/orders", label: "依頼管理", icon: ShoppingBag },
  { href: "/admin/payments", label: "売上・決済", icon: CreditCard },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="bg-slate-900 text-white shadow-md border-b-2 border-yellow-500">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-yellow-400" />
            <Link href="/admin" className="font-bold text-lg">
              Creative Base
              <span className="ml-2 text-xs bg-yellow-500 text-slate-900 px-2 py-0.5 rounded-full font-bold">管理画面</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors",
                    active ? "bg-white/20 text-white" : "text-slate-300 hover:text-white hover:bg-white/10"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-slate-300 hover:text-white hover:bg-white/10">
              <Link href="/mypage">マイページへ</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-white/10"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

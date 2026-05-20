"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard, Users, FileText, ShoppingBag, CreditCard, MessageSquare,
  LogOut, Shield, Globe, Layout, Package, Gift, Network, ChevronDown,
  UsersRound, FileEdit, DollarSign, Settings, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  icon: typeof LayoutDashboard;
  items: NavItem[];
}

const dashboardItem: NavItem = {
  href: "/admin",
  label: "ダッシュボード",
  icon: LayoutDashboard,
  exact: true,
};

const navGroups: NavGroup[] = [
  {
    label: "ユーザー・契約",
    icon: UsersRound,
    items: [
      { href: "/admin/users", label: "ユーザー管理", icon: Users },
      { href: "/admin/contracts", label: "契約管理", icon: FileText },
    ],
  },
  {
    label: "制作・LP",
    icon: FileEdit,
    items: [
      { href: "/admin/orders", label: "オーダー管理", icon: ShoppingBag },
      { href: "/admin/lp", label: "LP管理", icon: Globe },
      { href: "/admin/lp-templates", label: "テンプレート", icon: Layout },
    ],
  },
  {
    label: "売上・成果",
    icon: DollarSign,
    items: [
      { href: "/admin/payments", label: "決済管理", icon: CreditCard },
      { href: "/admin/referrals", label: "紹介報酬", icon: Gift },
      { href: "/admin/external-affiliates", label: "外部アフィリ", icon: Network },
    ],
  },
  {
    label: "設定・サポート",
    icon: Settings,
    items: [
      { href: "/admin/options", label: "オプション", icon: Package },
      { href: "/admin/stripe-setup", label: "Stripeセットアップ", icon: CreditCard },
      { href: "/admin/inquiries", label: "問い合わせ", icon: MessageSquare },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  const isDashboardActive = pathname === "/admin";

  const isGroupActive = (group: NavGroup) =>
    group.items.some((item) => pathname.startsWith(item.href));

  return (
    <header className="bg-slate-800 text-white shadow-md border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            <Shield className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-lg whitespace-nowrap">管理画面</span>
          </Link>

          {/* デスクトップ: プルダウン式メニュー */}
          <nav className="hidden md:flex items-center gap-1 mx-4">
            <Link
              href={dashboardItem.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors",
                isDashboardActive
                  ? "bg-white/20 text-white"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              )}
            >
              <dashboardItem.icon className="w-4 h-4" />
              {dashboardItem.label}
            </Link>

            {navGroups.map((group) => {
              const active = isGroupActive(group);
              return (
                <DropdownMenu key={group.label}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors outline-none",
                        active
                          ? "bg-white/20 text-white"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <group.icon className="w-4 h-4" />
                      {group.label}
                      <ChevronDown className="w-3 h-3 opacity-70" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52">
                    {group.items.map((item) => {
                      const itemActive = pathname.startsWith(item.href);
                      return (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-2 cursor-pointer w-full",
                              itemActive && "bg-slate-100 font-medium"
                            )}
                          >
                            <item.icon className="w-4 h-4 text-slate-600" />
                            <span>{item.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 shrink-0">
            {/* モバイル: 全メニューをドロップダウンで集約 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden text-slate-300 hover:text-white hover:bg-white/10"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href={dashboardItem.href} className="flex items-center gap-2 cursor-pointer">
                    <dashboardItem.icon className="w-4 h-4 text-slate-600" />
                    {dashboardItem.label}
                  </Link>
                </DropdownMenuItem>
                {navGroups.map((group) => (
                  <div key={group.label}>
                    <div className="px-2 py-1.5 text-xs font-medium text-slate-500 flex items-center gap-1.5 border-t mt-1 pt-2">
                      <group.icon className="w-3.5 h-3.5" />
                      {group.label}
                    </div>
                    {group.items.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center gap-2 cursor-pointer pl-6">
                          <item.icon className="w-4 h-4 text-slate-600" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

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

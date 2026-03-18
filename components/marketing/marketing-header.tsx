"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Phone, Mail, Menu, X } from "lucide-react";
import { RoundButton } from "./round-button";

const navLinks = [
  { href: "#services", label: "サービス一覧" },
  { href: "#pricing", label: "料金" },
  { href: "#flow", label: "ご依頼の流れ" },
  { href: "#why-us", label: "選ばれる理由" },
];

export function MarketingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
      )}
    >
      {/* Top contact bar */}
      <div className="hidden md:block bg-[var(--marketing-footer-bg)] text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-6 flex justify-end items-center gap-6">
          <a href="tel:0120-000-000" className="flex items-center gap-1 hover:text-[var(--marketing-pink)] transition-colors">
            <Phone className="w-3 h-3" />
            0120-000-000
          </a>
          <a href="mailto:info@datanote.net" className="flex items-center gap-1 hover:text-[var(--marketing-pink)] transition-colors">
            <Mail className="w-3 h-3" />
            info@datanote.net
          </a>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-xl text-[var(--marketing-text)] tracking-tight">
            Creative Base
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[var(--marketing-dark-gray)] hover:text-[var(--marketing-text)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[var(--marketing-dark-gray)] hover:text-[var(--marketing-text)] font-medium transition-colors"
            >
              ログイン
            </Link>
            <RoundButton href="/register" variant="dark" size="default">
              無料で始める
            </RoundButton>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="メニュー"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Gradient decoration line */}
      <div className="marketing-gradient-line" />

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="flex flex-col p-4 gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-2 text-sm font-medium text-[var(--marketing-text)]"
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <hr className="my-2" />
            <Link href="/login" className="py-2 text-sm text-[var(--marketing-dark-gray)]">
              ログイン
            </Link>
            <RoundButton href="/register" variant="dark">
              無料で始める
            </RoundButton>
          </nav>
        </div>
      )}
    </header>
  );
}

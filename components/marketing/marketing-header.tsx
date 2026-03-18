"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Phone, Mail, Menu, X, ChevronDown } from "lucide-react";
import { RoundButton } from "./round-button";

const SERVICE_LINKS = [
  { href: "/services/video", label: "動画制作", color: "#FFAFD4" },
  { href: "/services/lp", label: "LP制作", color: "#D5BAFF" },
  { href: "/services/multilingual", label: "多言語対応", color: "#88F2F2" },
  { href: "/services/ad-management", label: "広告運用代行", color: "#C9F77F" },
];

const navLinks = [
  { href: "#pricing", label: "料金" },
  { href: "#flow", label: "ご依頼の流れ" },
  { href: "#why-us", label: "選ばれる理由" },
];

export function MarketingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [isMobileServiceOpen, setIsMobileServiceOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsServiceOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsServiceOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsServiceOpen(false), 150);
  };

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
            {/* サービスドロップダウン */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="flex items-center gap-1 text-sm font-medium text-[var(--marketing-dark-gray)] hover:text-[var(--marketing-text)] transition-colors"
                onClick={() => setIsServiceOpen(!isServiceOpen)}
              >
                サービス
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    isServiceOpen && "rotate-180"
                  )}
                />
              </button>

              {/* ドロップダウンメニュー */}
              <div
                className={cn(
                  "absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200",
                  isServiceOpen
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2"
                )}
              >
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[220px]">
                  {/* サービス一覧リンク */}
                  <a
                    href="/#services"
                    className="block px-5 py-3 text-xs font-semibold text-[var(--marketing-dark-gray)] bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
                  >
                    サービス一覧
                  </a>
                  {SERVICE_LINKS.map((service) => (
                    <Link
                      key={service.href}
                      href={service.href}
                      className="flex items-center gap-3 px-5 py-3.5 text-sm text-[var(--marketing-text)] hover:bg-gray-50 transition-colors"
                      onClick={() => setIsServiceOpen(false)}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: service.color }}
                      />
                      {service.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* 他のナビリンク */}
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
          <nav className="flex flex-col p-4 gap-1">
            {/* モバイルサービスサブメニュー */}
            <button
              className="flex items-center justify-between py-2.5 text-sm font-medium text-[var(--marketing-text)]"
              onClick={() => setIsMobileServiceOpen(!isMobileServiceOpen)}
            >
              サービス
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isMobileServiceOpen && "rotate-180"
                )}
              />
            </button>

            {isMobileServiceOpen && (
              <div className="ml-4 space-y-1 pb-2">
                <a
                  href="/#services"
                  className="block py-2 text-xs font-semibold text-[var(--marketing-dark-gray)]"
                  onClick={() => setIsMobileOpen(false)}
                >
                  サービス一覧
                </a>
                {SERVICE_LINKS.map((service) => (
                  <Link
                    key={service.href}
                    href={service.href}
                    className="flex items-center gap-2 py-2 text-sm text-[var(--marketing-text)]"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: service.color }}
                    />
                    {service.label}
                  </Link>
                ))}
              </div>
            )}

            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-2.5 text-sm font-medium text-[var(--marketing-text)]"
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

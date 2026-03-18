import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const footerLinks = [
  { label: "サービス一覧", href: "#services" },
  { label: "料金プラン", href: "#pricing" },
  { label: "ご依頼の流れ", href: "#flow" },
  { label: "選ばれる理由", href: "#why-us" },
  { label: "ログイン", href: "/login" },
  { label: "新規登録", href: "/register" },
];

export function MarketingFooter() {
  return (
    <footer className="bg-[var(--marketing-footer-bg)] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Company info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Creative Base</h3>
            <p className="text-sm text-gray-400 mb-6">株式会社データノート</p>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>東京都渋谷区XXX X-XX-X</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span>0120-000-000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span>info@datanote.net</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
              Navigation
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Map placeholder */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
              Access
            </h4>
            <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-sm">
              Google Map
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} 株式会社データノート. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

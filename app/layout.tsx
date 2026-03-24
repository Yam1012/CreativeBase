import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Creative Base | 株式会社データノート",
  description: "Creative Base 会員管理システム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.className} bg-gray-50 text-gray-900`}>
        {children}
        <Toaster richColors position="top-center" />

        {/* レントラックス LP計測タグ */}
        <Script
          id="rentracks-lp"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(callback){
var script = document.createElement("script");
script.type = "text/javascript";
script.src = "https://www.rentracks.jp/js/itp/rt.track.js?t=" + (new Date()).getTime();
if ( script.readyState ) {
script.onreadystatechange = function() {
if ( script.readyState === "loaded" || script.readyState === "complete" ) {
script.onreadystatechange = null;
callback();
}
};
} else {
script.onload = function() {
callback();
};
}
document.getElementsByTagName("head")[0].appendChild(script);
}(function(){}));
`,
          }}
        />

        {/* もしもアフィリエイト LP計測タグ（ダミー：本番タグに差し替え） */}
        <Script
          id="moshimo-lp"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `console.log("[Moshimo] LP tracking tag loaded (dummy)");`,
          }}
        />
      </body>
    </html>
  );
}

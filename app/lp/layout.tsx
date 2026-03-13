/**
 * LPページ専用レイアウト — ナビなし、全幅
 * Tailwind CSSやアプリグローバルスタイルの影響を最小限にする
 */
export default function LpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

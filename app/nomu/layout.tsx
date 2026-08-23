import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "何飲む？ | メニュー写真から注文を集計",
  description:
    "居酒屋のメニュー写真を撮るだけで品目を読み取り、みんなの注文をまとめて店員さんに伝えられる形に集計します。",
};

export default function NomuLayout({ children }: { children: React.ReactNode }) {
  return children;
}

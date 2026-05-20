"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles } from "lucide-react";

interface Props {
  userName: string;
  userId: string;
}

/**
 * 初回ログイン時にチュートリアルへの誘いを表示するダイアログ
 * localStorage に表示済みフラグを保存
 */
export function WelcomeDialog({ userName, userId }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const key = `tutorial_seen_${userId}`;
    if (typeof window !== "undefined" && !localStorage.getItem(key)) {
      // 1秒遅らせて表示（UI読み込み完了後）
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [userId]);

  const markSeen = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`tutorial_seen_${userId}`, "1");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) markSeen(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl">
            ようこそ、{userName} さん！
          </DialogTitle>
          <DialogDescription className="text-sm pt-2 space-y-2">
            <p>Creative Base へのご登録ありがとうございます。</p>
            <p>はじめてご利用の方向けに、サービスの使い方を3分で確認できる「はじめてガイド」をご用意しました。</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <Button variant="outline" onClick={markSeen} className="sm:order-1">
            あとで見る
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-500 sm:order-2" onClick={markSeen}>
            <Link href="/mypage/tutorial">
              <BookOpen className="w-4 h-4 mr-1" /> ガイドを見る
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

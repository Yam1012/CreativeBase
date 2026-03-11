"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RegisterCompletePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 text-center">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">登録が完了しました</h2>
              <p className="text-gray-500 mt-2 text-sm">
                アカウント開設のご確認メールをお送りしました。<br />
                ご登録いただいたメールアドレスをご確認ください。
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-left space-y-1 text-gray-600">
              <p className="font-medium text-gray-800">次のステップ</p>
              <p>1. 確認メールをご確認ください</p>
              <p>2. マイページからサービスをご利用いただけます</p>
              <p>3. 年間の制作枠内で「動画」か「LP制作」をオーダーしてください</p>
            </div>
            <Button asChild className="w-full bg-slate-800 hover:bg-slate-700">
              <Link href="/login">ログインする</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

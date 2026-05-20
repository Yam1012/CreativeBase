"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, ArrowLeft, ArrowRight, CheckCircle2, ShoppingBag, FileText,
  MessageCircle, Download, Eye, Settings, Lightbulb, Package2, MessageSquareWarning,
  ThumbsUp, Sparkles, Rocket,
} from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  icon: typeof BookOpen;
  description: string;
  details: { label: string; content: React.ReactNode }[];
  cta?: { label: string; href: string };
}

const STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Creative Base へようこそ",
    icon: Sparkles,
    description: "動画・LP制作をかんたんに依頼できるクリエイティブ制作プラットフォームです",
    details: [
      {
        label: "できること",
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li>動画制作 / LP制作 の単発オーダー</li>
            <li>サブスクリプションで毎月決まった本数を制作</li>
            <li>制作チームとチャットでやり取り</li>
            <li>完成品データをダウンロード</li>
          </ul>
        ),
      },
      {
        label: "本チュートリアルの所要時間",
        content: <span>約3分</span>,
      },
    ],
  },
  {
    id: "courses",
    title: "ステップ 1: 契約コースを確認",
    icon: FileText,
    description: "ご契約中のコースと、年間で制作可能な本数を確認しましょう",
    details: [
      {
        label: "確認内容",
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li>契約コース名（Entry / Start Up / Standard）</li>
            <li>月額料金</li>
            <li>残り制作可能本数 / 年間本数</li>
            <li>次回課金日</li>
          </ul>
        ),
      },
      {
        label: "コースを変更したい",
        content: <span>「契約管理」→ 該当コースの「変更」ボタンから手続きできます</span>,
      },
    ],
    cta: { label: "契約管理を開く", href: "/mypage/contracts" },
  },
  {
    id: "order",
    title: "ステップ 2: 新規オーダー",
    icon: ShoppingBag,
    description: "動画・LP制作を依頼する流れです",
    details: [
      {
        label: "オーダー方法",
        content: (
          <ol className="list-decimal pl-5 space-y-1">
            <li>「オーダー一覧」→「新規オーダーを申し込む」</li>
            <li>目的を選択（プレゼン用 / プロモーション用）</li>
            <li>制作種別を選択（動画 / LP）</li>
            <li>必要なオプションを選択</li>
            <li>参考素材（議事録・商談動画など）をアップロード</li>
            <li>ご要望・備考を入力 → 申し込み</li>
          </ol>
        ),
      },
      {
        label: "ポイント",
        content: (
          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-600 inline mr-1" />
            参考素材は <strong>PDF / Word / PowerPoint / MP4 等</strong>（50MB以下）対応。複数アップロード可能です。
          </div>
        ),
      },
    ],
    cta: { label: "新規オーダー画面へ", href: "/mypage/orders/new" },
  },
  {
    id: "progress",
    title: "ステップ 3: 進捗確認",
    icon: Eye,
    description: "オーダー後の進捗ステータスを把握しましょう",
    details: [
      {
        label: "ステータスの流れ",
        content: (
          <div className="space-y-2">
            <StatusFlow label="受付中" color="bg-yellow-100 text-yellow-700" desc="ご注文を受け付けました" />
            <StatusFlow label="制作中" color="bg-blue-100 text-blue-700" desc="担当者が制作中です" />
            <StatusFlow label="確認待ち" color="bg-indigo-100 text-indigo-700" desc="完成品をご確認ください ← あなたの操作が必要！" />
            <StatusFlow label="完了" color="bg-green-100 text-green-700" desc="ご承認いただき、完了" />
          </div>
        ),
      },
      {
        label: "確認方法",
        content: <span>「オーダー一覧」から該当のオーダーをクリックすると、現在のステータスとファイルが見られます</span>,
      },
    ],
    cta: { label: "オーダー一覧を開く", href: "/mypage/orders" },
  },
  {
    id: "review",
    title: "ステップ 4: 完成品の確認・承認",
    icon: Package2,
    description: "制作チームから完成品がアップされたら、ご確認の上で承認します",
    details: [
      {
        label: "確認待ちになったら",
        content: (
          <ol className="list-decimal pl-5 space-y-1">
            <li>オーダー詳細を開く</li>
            <li>「完成品データ」セクション（緑色）からファイルをダウンロード</li>
            <li>内容を確認</li>
            <li>問題なければ「<strong className="text-green-600">承認する</strong>」ボタン</li>
            <li>修正が必要なら「<strong className="text-orange-600">修正依頼</strong>」ボタンから依頼内容を入力</li>
          </ol>
        ),
      },
      {
        label: "アクションボタン",
        content: (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded p-2 text-xs">
              <ThumbsUp className="w-4 h-4 text-green-600" />
              <span>承認 → オーダー完了</span>
            </div>
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded p-2 text-xs">
              <MessageSquareWarning className="w-4 h-4 text-orange-600" />
              <span>修正依頼 → 再制作依頼</span>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: "communication",
    title: "ステップ 5: 制作チームとのやり取り",
    icon: MessageCircle,
    description: "オーダー詳細のコメント欄で、制作チームと直接やり取りできます",
    details: [
      {
        label: "コメント機能",
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li>オーダー詳細ページの下部に「コメント」セクション</li>
            <li>制作の要望、確認事項、修正依頼などを記入</li>
            <li>制作チームからの返信もこちらに表示</li>
            <li>送信は **Ctrl + Enter** でも可能</li>
          </ul>
        ),
      },
      {
        label: "問い合わせフォーム",
        content: <span>システム全般のご質問は「お問い合わせ」メニューからお気軽にどうぞ</span>,
      },
    ],
    cta: { label: "お問い合わせ", href: "/mypage/inquiry" },
  },
  {
    id: "delivery",
    title: "ステップ 6: 完成品のダウンロード",
    icon: Download,
    description: "完成品データは「完成品データ」セクションから何度でもダウンロード可能です",
    details: [
      {
        label: "ダウンロード方法",
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li>オーダー詳細を開く</li>
            <li>緑色の「完成品データ」カードを確認</li>
            <li>各ファイルの「ダウンロード」ボタンをクリック</li>
          </ul>
        ),
      },
      {
        label: "LP制作の場合",
        content: (
          <span>
            HTMLファイルとしてダウンロード可能です。ご自身のサーバーまたはお客様サーバーにアップロードしてご利用ください。
          </span>
        ),
      },
    ],
  },
  {
    id: "account",
    title: "ステップ 7: アカウント設定",
    icon: Settings,
    description: "個人情報やパスワード、決済情報などを管理できます",
    details: [
      {
        label: "「アカウント設定」でできること",
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li>氏名・電話番号・住所の変更</li>
            <li>法人名・Chatwork ID の登録</li>
            <li>パスワード変更</li>
            <li>アカウント解約</li>
          </ul>
        ),
      },
      {
        label: "支払い履歴・領収書",
        content: (
          <span>
            「ダッシュボード → 最近の決済 → すべて表示」または直接「支払い履歴」ページから、過去の決済確認と領収書ダウンロードが可能です。
          </span>
        ),
      },
    ],
    cta: { label: "アカウント設定", href: "/mypage/profile" },
  },
  {
    id: "done",
    title: "チュートリアル完了！",
    icon: Rocket,
    description: "これで基本的な操作は完了です。さっそく Creative Base を使ってみましょう",
    details: [
      {
        label: "次のアクション",
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link href="/mypage" className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">ダッシュボードへ</span>
            </Link>
            <Link href="/mypage/orders/new" className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">最初のオーダーを作成</span>
            </Link>
          </div>
        ),
      },
      {
        label: "困ったときは",
        content: (
          <span>
            画面右上のヘルプアイコン、または「お問い合わせ」メニューからいつでもサポートを受けられます。
          </span>
        ),
      },
    ],
  },
];

function StatusFlow({ label, color, desc }: { label: string; color: string; desc: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Badge className={`shrink-0 w-20 justify-center ${color}`}>{label}</Badge>
      <span>{desc}</span>
    </div>
  );
}

export default function TutorialPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const Icon = step.icon;
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/mypage"><ArrowLeft className="w-4 h-4 mr-1" />マイページへ</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" /> はじめてガイド
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Creative Base の使い方を3分で確認できます
        </p>
      </div>

      {/* プログレスバー */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>ステップ {stepIndex + 1} / {STEPS.length}</span>
          <span>{Math.round(progress)}% 完了</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ステップカード */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{step.title}</CardTitle>
              <p className="text-gray-500 text-sm mt-0.5">{step.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {step.details.map((detail, i) => (
            <div key={i} className="space-y-2">
              <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {detail.label}
              </div>
              <div className="text-sm text-gray-600 pl-5">{detail.content}</div>
            </div>
          ))}

          {step.cta && (
            <div className="pt-2 border-t">
              <Button variant="outline" size="sm" asChild>
                <Link href={step.cta.href}>{step.cta.label} →</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ナビゲーション */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
          disabled={stepIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> 戻る
        </Button>

        <div className="flex items-center gap-1">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStepIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === stepIndex ? "w-6 bg-blue-600" : i < stepIndex ? "bg-blue-300" : "bg-gray-300"
              }`}
              aria-label={`ステップ ${i + 1}`}
            />
          ))}
        </div>

        {stepIndex < STEPS.length - 1 ? (
          <Button
            onClick={() => setStepIndex(stepIndex + 1)}
            className="bg-blue-600 hover:bg-blue-500"
          >
            次へ <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button asChild className="bg-green-600 hover:bg-green-500">
            <Link href="/mypage">
              <CheckCircle2 className="w-4 h-4 mr-1" /> 完了
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

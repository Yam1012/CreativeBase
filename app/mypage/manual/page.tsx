import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, FileText, Video, Presentation, Megaphone, Clock,
  Package2, Download, MessageCircle, Upload, Sparkles, BookOpen,
  CheckCircle2, AlertCircle, Lightbulb, Globe,
} from "lucide-react";

export const metadata = {
  title: "サービスマニュアル | Creative Base",
};

export default function ManualPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/mypage"><ArrowLeft className="w-4 h-4 mr-1" />マイページへ</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" /> サービスマニュアル
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Creative Base のサービス内容・使い方・仕様の完全ガイド
        </p>
      </div>

      {/* 目次 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">目次</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <li><a href="#about" className="text-blue-600 hover:underline">1. Creative Base とは</a></li>
            <li><a href="#video" className="text-blue-600 hover:underline">2. 動画制作サービス</a></li>
            <li><a href="#lp" className="text-blue-600 hover:underline">3. LP制作サービス</a></li>
            <li><a href="#plans" className="text-blue-600 hover:underline">4. 料金プラン</a></li>
            <li><a href="#flow" className="text-blue-600 hover:underline">5. 制作フロー</a></li>
            <li><a href="#materials" className="text-blue-600 hover:underline">6. 素材のご準備</a></li>
            <li><a href="#delivery" className="text-blue-600 hover:underline">7. 納品形式</a></li>
            <li><a href="#faq" className="text-blue-600 hover:underline">8. よくあるご質問</a></li>
          </ol>
        </CardContent>
      </Card>

      {/* 1. Creative Base とは */}
      <Card id="about">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            1. Creative Base とは
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Creative Base</strong> は、株式会社データノートが提供するクリエイティブ制作サービスです。
            お客様の素材をご提供いただくだけで、プロフェッショナルな <strong>動画</strong> や <strong>LP（ランディングページ）</strong> を制作・納品します。
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="font-medium text-blue-900 mb-1">こんな方におすすめ</p>
            <ul className="list-disc pl-5 space-y-0.5 text-blue-800">
              <li>営業資料を動画化したい</li>
              <li>商品・サービスの説明動画が欲しい</li>
              <li>キャンペーン用LPを短期間で用意したい</li>
              <li>定期的にプロモーション素材が必要</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 2. 動画制作サービス */}
      <Card id="video">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-500" />
            2. 動画制作サービス
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <p className="font-bold text-lg text-blue-900 mb-2">
              📊 PowerPoint資料を入稿するだけで動画になります
            </p>
            <p className="text-blue-800">
              既存の PowerPoint（PPT/PPTX）や PDF をアップロードいただくと、
              ナレーション・テロップ・トランジションを加えて、プロフェッショナルな動画として仕上げます。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border rounded-lg p-3">
              <div className="text-xs font-medium text-gray-500 mb-1">基本仕様</div>
              <ul className="text-sm space-y-1 list-disc pl-4">
                <li>標準: <strong>3分 / 12ページ</strong> 基準</li>
                <li>ナレーション付き</li>
                <li>BGM付き（著作権フリー）</li>
                <li>テロップ・字幕対応</li>
              </ul>
            </div>
            <div className="border rounded-lg p-3">
              <div className="text-xs font-medium text-gray-500 mb-1">出力形式</div>
              <ul className="text-sm space-y-1 list-disc pl-4">
                <li>MP4（H.264）</li>
                <li>解像度: フルHD（1920×1080）</li>
                <li>多言語対応可（オプション）</li>
                <li>SNS用縦型対応可（オプション）</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded p-3 flex gap-2">
            <Presentation className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">活用例</p>
              <ul className="text-amber-800 mt-1 space-y-0.5 list-disc pl-4">
                <li>営業資料の動画化（商談・プレゼン用）</li>
                <li>商品紹介動画</li>
                <li>採用説明会・採用ブランディング動画</li>
                <li>社内研修・マニュアル動画</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. LP制作サービス */}
      <Card id="lp">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-500" />
            3. LP制作サービス
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <p className="font-bold text-lg text-purple-900 mb-2">
              📄 商品情報を入稿するだけでLPになります
            </p>
            <p className="text-purple-800">
              商品概要・特徴・FAQ などの情報をご提供いただくと、
              テンプレートをベースに専門デザイナーがLP（1ページ完結型ウェブサイト）を制作します。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border rounded-lg p-3">
              <div className="text-xs font-medium text-gray-500 mb-1">基本仕様</div>
              <ul className="text-sm space-y-1 list-disc pl-4">
                <li>レスポンシブ対応（PC/スマホ/タブレット）</li>
                <li>SEO 基本対応</li>
                <li>Google Analytics タグ埋め込み可</li>
                <li>お問い合わせフォーム実装可（オプション）</li>
              </ul>
            </div>
            <div className="border rounded-lg p-3">
              <div className="text-xs font-medium text-gray-500 mb-1">納品形式</div>
              <ul className="text-sm space-y-1 list-disc pl-4">
                <li>HTML ファイル一式</li>
                <li>お客様サーバーへアップロードしてご利用</li>
                <li>当社サーバーでの公開も可（オプション）</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded p-3 flex gap-2">
            <Megaphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">活用例</p>
              <ul className="text-amber-800 mt-1 space-y-0.5 list-disc pl-4">
                <li>新商品ローンチページ</li>
                <li>キャンペーン専用LP</li>
                <li>セミナー・イベント告知ページ</li>
                <li>無料相談・資料請求の受付ページ</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. 料金プラン */}
      <Card id="plans">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            4. 料金プラン
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-2 text-left">プラン</th>
                  <th className="border p-2 text-right">月額（税別）</th>
                  <th className="border p-2 text-right">初期費用</th>
                  <th className="border p-2 text-right">年間本数</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-medium">Entry</td>
                  <td className="border p-2 text-right">¥10,000</td>
                  <td className="border p-2 text-right">¥100,000</td>
                  <td className="border p-2 text-right">12本</td>
                </tr>
                <tr className="bg-blue-50/50">
                  <td className="border p-2 font-medium">Start Up <Badge className="ml-1 bg-blue-600 text-white">人気</Badge></td>
                  <td className="border p-2 text-right">¥50,000</td>
                  <td className="border p-2 text-right">¥100,000</td>
                  <td className="border p-2 text-right">24本</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">Standard</td>
                  <td className="border p-2 text-right">¥100,000</td>
                  <td className="border p-2 text-right">¥100,000</td>
                  <td className="border p-2 text-right">48本</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border p-2 font-medium">スポット</td>
                  <td className="border p-2 text-right">—</td>
                  <td className="border p-2 text-right">—</td>
                  <td className="border p-2 text-right text-xs">¥50,000/本（3分/12P基準）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">
            ※ 「本数」は動画とLPを合算した年間の制作枠です（例: Entryの場合 動画8本+LP4本など自由に組合せ可能）<br />
            ※ 表記は全て税別です
          </p>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
            <Lightbulb className="w-4 h-4 inline mr-1" />
            LP制作を依頼すると、その月の動画制作1本が無料で追加されます（Start Up コース相当の特典）
          </p>
        </CardContent>
      </Card>

      {/* 5. 制作フロー */}
      <Card id="flow">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            5. 制作フロー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                icon: Upload,
                title: "STEP 1: オーダー申し込み",
                color: "bg-yellow-100 text-yellow-700",
                desc: "目的選択 → 種別選択 → 素材アップロード → ご要望入力",
                duration: "5分程度",
              },
              {
                icon: Sparkles,
                title: "STEP 2: 制作開始",
                color: "bg-blue-100 text-blue-700",
                desc: "担当者が素材を確認・制作着手。コメント欄でやり取り可能",
                duration: "通常3〜7営業日",
              },
              {
                icon: Package2,
                title: "STEP 3: 確認待ち",
                color: "bg-indigo-100 text-indigo-700",
                desc: "完成品データがアップロードされたら、メール通知が届きます",
                duration: "ご確認後",
              },
              {
                icon: CheckCircle2,
                title: "STEP 4: 承認 or 修正依頼",
                color: "bg-green-100 text-green-700",
                desc: "完成品を確認 →「承認」で完了、「修正依頼」で再制作（無料）",
                duration: "回数無制限",
              },
              {
                icon: Download,
                title: "STEP 5: 完成品ダウンロード",
                color: "bg-green-100 text-green-700",
                desc: "承認後、完成品データを何度でもダウンロード可能",
                duration: "随時",
              },
            ].map((s, i) => (
              <div key={i} className="flex gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-sm text-gray-600 mt-0.5">{s.desc}</div>
                  <div className="text-xs text-gray-400 mt-1">所要時間: {s.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 6. 素材のご準備 */}
      <Card id="materials">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            6. 素材のご準備
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <div className="font-semibold mb-2">対応ファイル形式</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded p-2 text-xs">
                <span className="font-medium">資料系:</span> PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX
              </div>
              <div className="bg-gray-50 rounded p-2 text-xs">
                <span className="font-medium">画像:</span> JPG, JPEG, PNG
              </div>
              <div className="bg-gray-50 rounded p-2 text-xs">
                <span className="font-medium">動画:</span> MP4, MOV, AVI
              </div>
              <div className="bg-gray-50 rounded p-2 text-xs">
                <span className="font-medium">最大サイズ:</span> 50MB / ファイル
              </div>
            </div>
          </div>

          <div>
            <div className="font-semibold mb-2">動画制作の場合の推奨素材</div>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>PowerPoint / Keynote</strong> 資料（最も簡単）</li>
              <li>商談・説明用の PDF 資料</li>
              <li>商品写真・ロゴ画像</li>
              <li>参考になる既存動画 or 競合動画（イメージ共有用）</li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-2">LP制作の場合の推奨素材</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>商品・サービスの紹介文章</li>
              <li>特徴・ベネフィットの箇条書き</li>
              <li>FAQ（想定問答）</li>
              <li>お客様の声・実績</li>
              <li>商品写真・ロゴ画像</li>
              <li>参考LPのURL（イメージ共有用）</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded p-3 flex gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">素材は完璧でなくてOK</p>
              <p className="text-amber-800 mt-1">
                既存の資料・メモ・走り書きでも、制作チームが整理・整形して仕上げます。「これは使えるかな？」と迷ったら、まずはアップロードしてみてください。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7. 納品形式 */}
      <Card id="delivery">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package2 className="w-5 h-5 text-green-600" />
            7. 納品形式
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-4 h-4 text-blue-500" />
                <strong>動画</strong>
              </div>
              <ul className="text-xs space-y-1 list-disc pl-4">
                <li>MP4ファイル</li>
                <li>マイページからダウンロード</li>
                <li>SNS用に縦型・正方形版も納品可（オプション）</li>
              </ul>
            </div>
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-purple-500" />
                <strong>LP</strong>
              </div>
              <ul className="text-xs space-y-1 list-disc pl-4">
                <li>HTMLファイル一式（ZIP形式）</li>
                <li>お客様サーバーへアップロードしてご利用</li>
                <li>当社で公開も可（公開代行 +¥50,000）</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            納品物は「完成品データ」セクションから何度でもダウンロード可能です。バックアップとしてお手元に保存することを推奨します。
          </p>
        </CardContent>
      </Card>

      {/* 8. FAQ */}
      <Card id="faq">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            8. よくあるご質問
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {[
            {
              q: "PowerPointを入稿すれば本当に動画になるの？",
              a: "はい。PowerPointの各スライドを動画の1シーンとして構成し、ナレーション・テロップ・BGMを加えて仕上げます。スライドのテキストや画像は基本的にそのまま活用されますが、必要に応じてレイアウト調整も行います。",
            },
            {
              q: "修正は何回までできますか？",
              a: "修正回数の制限はありません。完成品のご確認時に「修正依頼」をいただければ、ご納得いただけるまで対応します。ただし、大幅な仕様変更（全面リニューアル等）は別途お見積もりとなる場合があります。",
            },
            {
              q: "納品までどのくらいかかりますか？",
              a: "通常 3〜7営業日 が目安です。素材の準備状況や制作内容により前後します。お急ぎの場合は「最速納品」オプション（追加料金）をご利用ください。",
            },
            {
              q: "サブスクの年間本数を使い切れなかった場合は？",
              a: "翌年への繰り越しはできません。月々の本数バランスを見ながら計画的にご利用ください。残数はマイページの契約管理から確認できます。",
            },
            {
              q: "解約はいつでもできますか？",
              a: "はい、いつでも可能です。アカウント設定 → 解約手続きから行えます。残期間分は日割りで返金いたします。",
            },
            {
              q: "LPは自分のドメインで公開できますか？",
              a: "もちろん可能です。HTMLファイル一式を納品しますので、お客様のサーバーにアップロードしてご自由にお使いください。ドメイン取得のサポートもオプションでご利用いただけます。",
            },
            {
              q: "制作チームと直接やり取りしたい",
              a: "オーダー詳細ページのコメント機能から、制作担当者と直接やり取りできます。また、Chatworkでのコミュニケーションも可能です（アカウント設定で Chatwork ID を登録）。",
            },
            {
              q: "領収書は発行できますか？",
              a: "はい。マイページ → 支払い履歴から、各決済の領収書（Stripe発行のPDF）をダウンロードできます。",
            },
          ].map((faq, i) => (
            <div key={i} className="border-l-4 border-blue-500 pl-3 py-1">
              <div className="font-semibold text-gray-900">Q. {faq.q}</div>
              <div className="text-gray-600 mt-1">A. {faq.a}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* お問い合わせ */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-6 text-center space-y-3">
          <MessageCircle className="w-10 h-10 text-blue-600 mx-auto" />
          <div className="font-semibold">その他のご質問は、お問い合わせフォームへ</div>
          <Button asChild className="bg-blue-600 hover:bg-blue-500">
            <Link href="/mypage/inquiry">お問い合わせ</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

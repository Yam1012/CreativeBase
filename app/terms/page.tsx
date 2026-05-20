import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "利用規約 | Creative Base",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/"><ArrowLeft className="w-4 h-4 mr-1" />トップへ戻る</Link>
        </Button>

        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-10 space-y-6 text-sm leading-relaxed">
          <header className="border-b pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Creative Base 利用規約</h1>
            <p className="text-xs text-gray-500 mt-2">最終更新日：2026年5月20日</p>
          </header>

          <section className="space-y-3">
            <p>
              この利用規約（以下「本規約」といいます）は、株式会社データノート（以下「当社」といいます）が提供するクリエイティブ制作サービス「Creative Base」（以下「本サービス」といいます）の利用条件を定めるものです。本サービスを利用する登録ユーザー（以下「利用者」といいます）には、本規約に従って本サービスを利用していただきます。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">第1条（適用）</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>本規約は、利用者と当社との間の本サービスの利用に関わる一切の関係に適用されます。</li>
              <li>当社は本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め（以下「個別規定」といいます）をすることがあります。これら個別規定はその名称のいかんに関わらず、本規約の一部を構成するものとします。</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">第2条（利用登録）</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>本サービスの利用を希望する者は、本規約に同意の上、当社の定める方法によって利用登録を申請するものとします。</li>
              <li>当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあります：
                <ul className="list-disc pl-5 mt-1">
                  <li>虚偽の事項を届け出た場合</li>
                  <li>本規約に違反したことがある者からの申請である場合</li>
                  <li>その他、当社が利用登録を相当でないと判断した場合</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">第3条（利用料金および支払方法）</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>利用者は、本サービスの有料部分の対価として、当社が別途定め、本ウェブサイトに表示する利用料金を、当社が指定する方法により支払うものとします。</li>
              <li>利用者が利用料金の支払を遅滞した場合、利用者は年14.6%の割合による遅延損害金を支払うものとします。</li>
              <li>支払い方法はクレジットカード決済（Stripeを利用）とし、決済成立後は原則として返金は行いません。ただし、当社の判断によりサービス停止期間相当の日割り返金を行う場合があります。</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">第4条（禁止事項）</h2>
            <p>利用者は、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為</li>
              <li>当社、ほかの利用者、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
              <li>本サービスによって得られた情報を商業的に利用する行為（当社の許諾を得たものを除く）</li>
              <li>当社のサービスの運営を妨害するおそれのある行為</li>
              <li>不正アクセスをし、またはこれを試みる行為</li>
              <li>他の利用者に関する個人情報等を収集または蓄積する行為</li>
              <li>不正な目的を持って本サービスを利用する行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">第5条（本サービスの提供の停止等）</h2>
            <p>当社は、以下のいずれかの事由があると判断した場合、利用者に事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
              <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
              <li>コンピュータまたは通信回線等が事故により停止した場合</li>
              <li>その他、当社が本サービスの提供が困難と判断した場合</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">第6条（著作権・成果物）</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>本サービスを通じて当社が制作・納品したコンテンツ（動画、LP、画像、テキスト等。以下「成果物」といいます）の著作権は、利用者が利用料金を完納した時点で利用者に譲渡されるものとします。</li>
              <li>ただし、当社が制作過程で使用した素材・テンプレート・ツール等の権利は当社または第三者に帰属し、利用者は成果物として組み込まれた範囲を超えてこれらを利用することはできません。</li>
              <li>利用者が当社に提供した素材（議事録、動画、画像等）の著作権は利用者に帰属しますが、当社は本サービスの提供に必要な範囲でこれを利用できるものとします。</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">第7条（利用制限および登録抹消）</h2>
            <p>当社は、利用者が以下のいずれかに該当する場合には、事前の通知なく、利用者に対して、本サービスの全部もしくは一部の利用を制限し、または利用者としての登録を抹消することができるものとします。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>本規約のいずれかの条項に違反した場合</li>
              <li>登録事項に虚偽の事実があることが判明した場合</li>
              <li>料金等の支払債務の不履行があった場合</li>
              <li>当社からの連絡に対し、一定期間返答がない場合</li>
              <li>本サービスについて、最終の利用から一定期間利用がない場合</li>
              <li>その他、当社が本サービスの利用を適当でないと判断した場合</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">第8条（保証の否認および免責事項）</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>当社は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます）がないことを明示的にも黙示的にも保証しておりません。</li>
              <li>当社は、本サービスに起因して利用者に生じたあらゆる損害について一切の責任を負いません。ただし、当社と利用者との契約が消費者契約に該当する場合、この免責規定は適用されません。</li>
              <li>前項ただし書に定める場合であっても、当社は、当社の過失（重過失を除きます）による債務不履行または不法行為により利用者に生じた損害のうち特別な事情から生じた損害については一切の責任を負いません。</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">第9条（サービス内容の変更等）</h2>
            <p>当社は、利用者に通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによって利用者に生じた損害について一切の責任を負いません。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">第10条（利用規約の変更）</h2>
            <p>当社は、必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができるものとします。本規約の変更後、本サービスの利用を開始した場合には、当該利用者は変更後の規約に同意したものとみなします。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">第11条（個人情報の取扱い）</h2>
            <p>当社は、本サービスの利用によって取得する個人情報については、当社「<Link href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</Link>」に従い適切に取り扱うものとします。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">第12条（準拠法・裁判管轄）</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
              <li>本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。</li>
            </ol>
          </section>

          <footer className="border-t pt-4 mt-8 text-xs text-gray-500">
            <p>以上</p>
            <p className="mt-2">株式会社データノート</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

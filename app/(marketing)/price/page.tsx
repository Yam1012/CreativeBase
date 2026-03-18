import Link from "next/link";
import { ChevronRight, CheckCircle } from "lucide-react";
import {
  SectionHeader,
  RoundButton,
  FadeInOnScroll,
  CTABand,
} from "@/components/marketing";
import { PricingTable } from "@/components/marketing/pricing-table";
import { FAQAccordion } from "@/components/marketing/faq-accordion";

export const metadata = {
  title: "料金プラン | Creative Base",
  description:
    "Creative Baseの料金プラン。サブスクリプション3プランとAI個別サービス料金の詳細をご紹介します。",
};

/* ─── Data ─── */

const PLANS = [
  {
    name: "Start Up",
    yearlyPrice: 120000,
    monthlyPrice: 10000,
    color: "#FFAFD4",
    features: [
      "年12本制作",
      "68言語対応",
      "動画・LP選択可",
    ],
  },
  {
    name: "Standard",
    yearlyPrice: 600000,
    monthlyPrice: 50000,
    color: "#D5BAFF",
    recommended: true,
    features: [
      "年24本制作",
      "68言語対応",
      "動画・LP選択可",
      "優先サポート",
    ],
  },
  {
    name: "Enterprise",
    yearlyPrice: 1200000,
    monthlyPrice: 100000,
    color: "#88F2F2",
    features: [
      "年48本制作",
      "68言語対応",
      "動画・LP選択可",
      "専任担当者",
      "カスタム対応",
    ],
  },
];

const AI_PRICING = [
  {
    title: "AIモデル生成",
    accentColor: "#FFC68D",
    items: [
      { label: "既存AIモデル契約", price: "¥10,000/年", note: "（3年目以降無料）" },
      { label: "オリジナルAIモデル制作", price: "¥20,000〜", note: "（買取）" },
      { label: "AIモデル × 商品合成", price: "¥5,000〜/点" },
      { label: "表情・スタイリング変更", price: "¥5,000〜/点" },
      { label: "高解像度アップスケール", price: "¥3,000〜/点" },
    ],
  },
  {
    title: "AIバナー・クリエイティブ制作",
    accentColor: "#FFE066",
    items: [
      { label: "バナーデザイン", price: "¥30,000〜/点" },
      { label: "多言語バナー同時制作", price: "別途見積" },
      { label: "LP連動クリエイティブ", price: "¥50,000〜/セット" },
      { label: "A/Bテスト用バリエーション", price: "¥10,000〜/点" },
    ],
  },
  {
    title: "AIインフルエンサー運用",
    accentColor: "#FFA2A2",
    items: [
      { label: "AIインフルエンサー作成", price: "¥120,000〜", note: "（買取）" },
      { label: "SNS運用代行", price: "¥200,000〜/月" },
      { label: "動画コンテンツ制作", price: "¥30,000〜/本" },
      { label: "広告運用代行", price: "広告費の20%" },
    ],
  },
];

const CREATIVE_PRICING = [
  {
    title: "動画制作",
    accentColor: "#FFAFD4",
    items: [
      { label: "プラン内制作", price: "月額に含む" },
      { label: "スポットオーダー", price: "¥50,000/本", note: "（3分/12P基準）" },
      { label: "ナレーション収録", price: "¥10,000〜/本" },
      { label: "多言語字幕・吹替", price: "¥5,000〜/言語" },
    ],
  },
  {
    title: "LP制作",
    accentColor: "#D5BAFF",
    items: [
      { label: "プラン内制作", price: "月額に含む" },
      { label: "スポットオーダー", price: "¥50,000/本" },
      { label: "フォーム実装", price: "含む" },
      { label: "A/Bテスト設計", price: "¥30,000〜" },
    ],
  },
  {
    title: "多言語対応",
    accentColor: "#88F2F2",
    items: [
      { label: "プラン内翻訳", price: "月額に含む" },
      { label: "追加翻訳", price: "¥5,000〜/言語" },
      { label: "ネイティブ校正", price: "¥8,000〜/言語" },
      { label: "用語集・スタイルガイド作成", price: "¥30,000〜" },
    ],
  },
  {
    title: "撮影サービス",
    accentColor: "#C9F77F",
    items: [
      { label: "商品撮影（半日）", price: "¥80,000〜" },
      { label: "商品撮影（1日）", price: "¥150,000〜" },
      { label: "AI合成用撮影", price: "¥80,000〜" },
      { label: "スタジオレンタル", price: "別途見積" },
    ],
  },
];

const COMPARISON_FEATURES = [
  { label: "月額料金", values: ["¥10,000", "¥50,000", "¥100,000"] },
  { label: "年間制作本数", values: ["12本", "24本", "48本"] },
  { label: "68言語対応", values: ["○", "○", "○"] },
  { label: "動画・LP選択可", values: ["○", "○", "○"] },
  { label: "優先サポート", values: ["−", "○", "○"] },
  { label: "専任担当者", values: ["−", "−", "○"] },
  { label: "AIモデル制作", values: ["別途", "別途", "1体含む"] },
  { label: "AIバナー制作", values: ["別途", "別途", "月3点含む"] },
  { label: "カスタム対応", values: ["−", "−", "○"] },
];

const PRICING_FAQ = [
  {
    question: "初期費用はかかりますか？",
    answer:
      "全プラン共通で初期設定費用¥100,000（税別）が必要です。アカウント開設、初回ヒアリング、制作環境のセットアップが含まれます。",
  },
  {
    question: "プランの途中変更は可能ですか？",
    answer:
      "はい、月単位でプランの変更が可能です。アップグレードは即日反映、ダウングレードは次月から適用されます。日割り計算で差額を調整いたします。",
  },
  {
    question: "AI個別サービスはプラン契約なしでも利用できますか？",
    answer:
      "はい、AIモデル生成・AIバナー制作・AIインフルエンサー運用はスポット（単発）でもご利用いただけます。プランご契約中のお客様には割引価格を適用いたします。",
  },
  {
    question: "支払い方法は何がありますか？",
    answer:
      "クレジットカード（Visa・Mastercard・AMEX）と銀行振込に対応しています。年間一括払いの場合、月額×10ヶ月分の割引価格が適用されます。",
  },
  {
    question: "解約に違約金はかかりますか？",
    answer:
      "違約金は一切かかりません。解約は月末までにお申し出いただければ、翌月末で契約終了となります。",
  },
];

/* ─── Page ─── */

export default function PricePage() {
  return (
    <>
      {/* ═══ Section 1: Hero ═══ */}
      <section
        className="relative overflow-hidden py-20 sm:py-28"
        style={{ backgroundColor: "var(--marketing-dark-gray)" }}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
          <span
            className="marketing-bg-text text-white"
            style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }}
          >
            PRICING
          </span>
        </div>

        <div className="relative mx-auto max-w-5xl px-6">
          <nav className="mb-8 flex items-center gap-1.5 text-sm text-white/50">
            <Link href="/" className="transition-colors hover:text-white/80">
              トップ
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white/80">料金プラン</span>
          </nav>

          <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            <span
              className="mr-3 inline-block h-4 w-4 rounded-sm"
              style={{ background: "var(--marketing-gradient-main)" }}
            />
            料金プラン
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            ビジネスの規模に合わせた3つのサブスクリプションプランと、AI個別サービスをご用意しています。
          </p>
        </div>
      </section>

      {/* ═══ Section 2: Subscription Plans ═══ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <FadeInOnScroll>
            <SectionHeader
              title="サブスクリプションプラン"
              englishTitle="SUBSCRIPTION"
              accentColor="bg-[#D5BAFF]"
              align="center"
            />
          </FadeInOnScroll>

          <FadeInOnScroll delay={100}>
            <p className="mb-4 text-center text-sm text-[var(--marketing-dark-gray)]">
              ※ 全プラン共通で初期設定費用{" "}
              <strong>¥100,000（税別）</strong> が別途かかります
            </p>
          </FadeInOnScroll>

          <div className="mt-8 grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
            {PLANS.map((plan, i) => (
              <FadeInOnScroll key={plan.name} delay={i * 150} className="h-full">
                <div
                  className="relative flex h-full flex-col overflow-hidden rounded-2xl border-2 bg-white transition-all hover:shadow-lg"
                  style={{
                    borderColor: plan.recommended ? plan.color : "#E5E7EB",
                  }}
                >
                  <div
                    className="h-1.5 shrink-0"
                    style={{ backgroundColor: plan.color }}
                  />

                  {plan.recommended && (
                    <div className="absolute top-4 right-4">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-bold text-white"
                        style={{ backgroundColor: plan.color }}
                      >
                        人気
                      </span>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-8">
                    <h3 className="mb-2 text-xl font-bold text-[var(--marketing-text)]">
                      {plan.name}
                    </h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-[var(--marketing-text)]">
                        ¥{plan.yearlyPrice.toLocaleString()}
                      </span>
                      <span className="text-sm text-[var(--marketing-dark-gray)]">
                        /年
                      </span>
                      <div className="mt-1 text-xs text-[var(--marketing-dark-gray)]">
                        月額 ¥{plan.monthlyPrice.toLocaleString()}（税別）
                      </div>
                    </div>

                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-[var(--marketing-dark-gray)]"
                        >
                          <CheckCircle
                            className="h-4 w-4 shrink-0"
                            style={{ color: plan.color }}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto">
                      <RoundButton
                        href="/register"
                        variant={plan.recommended ? "purple" : "dark"}
                        className="w-full justify-center"
                      >
                        このプランで始める
                      </RoundButton>
                    </div>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>

          <FadeInOnScroll delay={500}>
            <p className="mt-8 text-center text-xs text-[var(--marketing-dark-gray)]">
              スポットオーダー（単発）: ¥50,000（税別）/ 1本もご利用いただけます
            </p>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ═══ Section 3: AI Individual Pricing ═══ */}
      <section
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--marketing-light-gray)" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <FadeInOnScroll>
            <SectionHeader
              title="AI個別サービス料金"
              englishTitle="AI SERVICES"
              accentColor="bg-[#FFC68D]"
              align="center"
            />
          </FadeInOnScroll>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {AI_PRICING.map((item, i) => (
              <PricingTable
                key={item.title}
                title={item.title}
                accentColor={item.accentColor}
                items={item.items}
                delay={i * 150}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 4: Creative Service Pricing ═══ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <FadeInOnScroll>
            <SectionHeader
              title="クリエイティブ制作料金"
              englishTitle="CREATIVE"
              accentColor="bg-[#FFAFD4]"
              align="center"
            />
          </FadeInOnScroll>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CREATIVE_PRICING.map((item, i) => (
              <PricingTable
                key={item.title}
                title={item.title}
                accentColor={item.accentColor}
                items={item.items}
                delay={i * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 5: Comparison Table ═══ */}
      <section
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--marketing-light-gray)" }}
      >
        <div className="mx-auto max-w-4xl px-6">
          <FadeInOnScroll>
            <SectionHeader
              title="プラン比較表"
              englishTitle="COMPARISON"
              accentColor="bg-[#88F2F2]"
              align="center"
            />
          </FadeInOnScroll>

          <FadeInOnScroll delay={200}>
            <div className="mt-10 overflow-x-auto rounded-2xl bg-white shadow-sm">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr
                    className="border-b-2"
                    style={{ borderColor: "var(--marketing-light-gray)" }}
                  >
                    <th className="p-4 text-left text-sm font-medium text-[var(--marketing-dark-gray)]">
                      機能
                    </th>
                    {PLANS.map((plan) => (
                      <th
                        key={plan.name}
                        className="p-4 text-center text-sm font-bold"
                        style={{ color: "var(--marketing-text)" }}
                      >
                        <span
                          className="mb-1 inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: plan.color }}
                        />
                        <br />
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((row, i) => (
                    <tr
                      key={row.label}
                      className="border-b last:border-b-0"
                      style={{
                        borderColor: "var(--marketing-light-gray)",
                        backgroundColor: i % 2 === 0 ? "transparent" : "#FAFAFA",
                      }}
                    >
                      <td className="p-4 text-sm text-[var(--marketing-text)]">
                        {row.label}
                      </td>
                      {row.values.map((val, j) => (
                        <td
                          key={j}
                          className="p-4 text-center text-sm font-medium"
                          style={{
                            color:
                              val === "○"
                                ? PLANS[j].color
                                : val === "−"
                                  ? "#D1D5DB"
                                  : "var(--marketing-text)",
                          }}
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ═══ Section 6: FAQ ═══ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <FadeInOnScroll>
            <SectionHeader
              title="料金に関するよくあるご質問"
              englishTitle="FAQ"
              accentColor="bg-[#D5BAFF]"
              align="center"
            />
          </FadeInOnScroll>

          <div className="mt-14">
            <FAQAccordion items={PRICING_FAQ} accentColor="#D5BAFF" />
          </div>
        </div>
      </section>

      {/* ═══ Section 7: CTA ═══ */}
      <CTABand
        title="まずはお気軽にご相談ください"
        subtitle="料金やプランに関するご質問もお気軽にお問い合わせください。"
        buttonText="無料で相談する"
        buttonHref="/register"
      />
    </>
  );
}

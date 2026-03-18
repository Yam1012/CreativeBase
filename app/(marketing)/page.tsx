import {
  SectionHeader,
  RoundButton,
  ServiceCard,
  StepFlow,
  CTABand,
  FadeInOnScroll,
} from "@/components/marketing";
import { CheckCircle, Video, Globe, BarChart3, Layers, Zap, Shield, HeadphonesIcon, UserCircle, Image, Megaphone } from "lucide-react";

/* ─── Data ─── */

const SERVICES = [
  { number: "01", title: "動画制作", description: "AI×プロクリエイターによる高品質な動画制作。企業VP、商品紹介、SNS広告など多彩な用途に対応します。", color: "#FFAFD4", href: "/services/video" },
  { number: "02", title: "LP制作", description: "コンバージョンに最適化されたランディングページを制作。デザインからコーディングまでワンストップで対応。", color: "#D5BAFF", href: "/services/lp" },
  { number: "03", title: "多言語対応", description: "68言語に対応したコンテンツ制作。グローバル展開をサポートする翻訳・ローカライズサービス。", color: "#88F2F2", href: "/services/multilingual" },
  { number: "04", title: "広告運用代行", description: "Google・SNS広告の運用代行。データ分析に基づく最適化で、ROI最大化を実現します。", color: "#C9F77F", href: "/services/ad-management" },
];

const AI_SERVICES = [
  { number: "05", title: "AIモデル生成", description: "リアルなAIモデルを生成。キャスティング不要でコスト削減。年齢・性別・国籍を自由に設定可能。", color: "#FFC68D", href: "/services/ai-model" },
  { number: "06", title: "AIバナー制作", description: "AIモデル×デザインでバナー制作。11業種対応。多言語バナー同時制作でグローバル展開を加速。", color: "#FFE066", href: "/services/ai-banner" },
  { number: "07", title: "AIインフルエンサー", description: "AIインフルエンサー作成+SNS運用代行。多言語SNS展開と動画コンテンツ連携を実現。", color: "#FFA2A2", href: "/services/ai-influencer" },
];

const WHY_US = [
  { icon: Zap, title: "圧倒的なスピード", description: "AI技術を活用し、従来の制作期間を大幅に短縮。スピーディーな納品を実現します。", color: "#FFAFD4" },
  { icon: Shield, title: "プロ品質の保証", description: "経験豊富なクリエイターとAIのハイブリッド制作で、高いクオリティを維持します。", color: "#D5BAFF" },
  { icon: HeadphonesIcon, title: "充実のサポート", description: "専任のサポートチームが制作から運用までトータルでサポートいたします。", color: "#C9F77F" },
];

const STEPS = [
  { number: "01", title: "お問い合わせ", description: "フォームまたはお電話でお気軽にお問い合わせください。" },
  { number: "02", title: "ヒアリング", description: "ご要望やターゲットについて詳しくお伺いし、最適なプランをご提案します。" },
  { number: "03", title: "ご契約", description: "プランを決定し、ご契約手続きを行います。最短即日で制作開始可能です。" },
  { number: "04", title: "制作開始", description: "プロのクリエイター＋AIが制作を開始。進捗はリアルタイムで確認できます。" },
  { number: "05", title: "納品・運用", description: "完成した制作物を納品。修正対応や運用サポートも継続的に行います。" },
];

const PLANS = [
  { name: "Start Up", yearlyPrice: 120000, monthlyPrice: 10000, creations: 12, color: "#FFAFD4", features: ["年12本制作", "68言語対応", "動画・LP選択可"] },
  { name: "Standard", yearlyPrice: 600000, monthlyPrice: 50000, creations: 24, color: "#D5BAFF", recommended: true, features: ["年24本制作", "68言語対応", "動画・LP選択可", "優先サポート"] },
  { name: "Enterprise", yearlyPrice: 1200000, monthlyPrice: 100000, creations: 48, color: "#88F2F2", features: ["年48本制作", "68言語対応", "動画・LP選択可", "専任担当者", "カスタム対応"] },
];

const WORKS = [
  { title: "企業VP動画", category: "動画制作" },
  { title: "ECサイトLP", category: "LP制作" },
  { title: "SNS広告バナー", category: "広告制作" },
  { title: "多言語サイト", category: "多言語対応" },
  { title: "商品紹介動画", category: "動画制作" },
  { title: "リクルートLP", category: "LP制作" },
];

const NEWS = [
  { date: "2026.03.15", title: "Creative Base サービスサイトをリニューアルしました" },
  { date: "2026.03.01", title: "新プラン「Enterprise」の提供を開始しました" },
  { date: "2026.02.15", title: "多言語対応サービスを68言語に拡充しました" },
];

/* ─── Page ─── */

export default function MarketingPage() {
  return (
    <>
      {/* ═══ Section 1: Hero ═══ */}
      <section className="relative min-h-screen bg-[var(--marketing-footer-bg)] flex items-center overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ background: "#FFA2A2" }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15 blur-3xl" style={{ background: "#B593FF" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl" style={{ background: "#84CBFF" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 text-center">
          {/* Gradient accent line */}
          <div className="w-20 h-1 mx-auto mb-8 rounded-full" style={{ background: "var(--marketing-gradient-main)" }} />

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            AI
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--marketing-gradient-main)" }}>
              {" "}× Creative
            </span>
            <br />
            で、ビジネスを加速する
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            動画制作・LP制作・多言語対応・AIクリエイティブをワンストップで。
            <br className="hidden md:block" />
            AI×プロクリエイターが、あなたのビジネスを次のステージへ。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <RoundButton href="/register" variant="pink" size="lg">
              無料で始める
            </RoundButton>
            <RoundButton href="#services" variant="outline" size="lg">
              サービスを見る
            </RoundButton>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: "68", label: "対応言語" },
              { value: "3", label: "料金プラン" },
              { value: "24h", label: "サポート対応" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: "var(--marketing-gradient-main)" }}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 text-xs">
            <span>SCROLL</span>
            <div className="w-px h-8 bg-gradient-to-b from-gray-500 to-transparent animate-pulse" />
          </div>
        </div>
      </section>

      {/* ═══ Section 2: About ═══ */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInOnScroll>
            <SectionHeader
              title="Creative Baseとは"
              englishTitle="ABOUT"
              accentColor="bg-[var(--marketing-pink)]"
            />
          </FadeInOnScroll>

          <FadeInOnScroll delay={200}>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-[var(--marketing-dark-gray)] leading-relaxed text-lg mb-8">
                Creative Baseは、AI技術とプロのクリエイターの力を融合した、
                次世代のクリエイティブ制作プラットフォームです。
              </p>
              <p className="text-[var(--marketing-dark-gray)] leading-relaxed">
                動画制作、ランディングページ制作、多言語コンテンツの制作まで、
                ビジネスに必要なクリエイティブをワンストップで提供。
                従来の制作プロセスをAIで効率化し、高品質かつスピーディーな制作を実現します。
              </p>
            </div>
          </FadeInOnScroll>

          {/* Feature icons row */}
          <FadeInOnScroll delay={400}>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mt-16">
              {[
                { icon: Video, label: "動画制作", color: "#FFAFD4" },
                { icon: Layers, label: "LP制作", color: "#D5BAFF" },
                { icon: Globe, label: "多言語対応", color: "#88F2F2" },
                { icon: BarChart3, label: "広告運用", color: "#C9F77F" },
                { icon: UserCircle, label: "AIモデル", color: "#FFC68D" },
                { icon: Image, label: "AIバナー", color: "#FFE066" },
                { icon: Megaphone, label: "AIインフルエンサー", color: "#FFA2A2" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gray-50">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}30` }}>
                    <item.icon className="w-7 h-7" style={{ color: item.color }} />
                  </div>
                  <span className="text-sm font-medium text-[var(--marketing-text)]">{item.label}</span>
                </div>
              ))}
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ═══ Section 3: Services ═══ */}
      <section id="services" className="py-24 bg-[var(--marketing-light-gray)]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInOnScroll>
            <SectionHeader
              title="サービス一覧"
              englishTitle="SERVICE"
              accentColor="bg-[var(--marketing-cyan)]"
            />
          </FadeInOnScroll>

          {/* 既存4サービス */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service, i) => (
              <ServiceCard
                key={service.number}
                number={service.number}
                title={service.title}
                description={service.description}
                accentColor={service.color}
                delay={i * 150}
                href={service.href}
              />
            ))}
          </div>

          {/* AI-Powered セパレーター */}
          <FadeInOnScroll delay={200}>
            <div className="flex items-center gap-4 my-12">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              <span className="text-sm font-bold tracking-widest text-[var(--marketing-dark-gray)] uppercase flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FFC68D]" />
                AI-Powered Services
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            </div>
          </FadeInOnScroll>

          {/* AI 3サービス */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AI_SERVICES.map((service, i) => (
              <ServiceCard
                key={service.number}
                number={service.number}
                title={service.title}
                description={service.description}
                accentColor={service.color}
                delay={i * 150}
                href={service.href}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 4: Why Us ═══ */}
      <section id="why-us" className="py-24 bg-[var(--marketing-dark-gray)]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInOnScroll>
            <SectionHeader
              title="選ばれる3つの理由"
              englishTitle="WHY US"
              accentColor="bg-[var(--marketing-purple)]"
              darkBg
            />
          </FadeInOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHY_US.map((item, i) => (
              <FadeInOnScroll key={item.title} delay={i * 200}>
                <div className="text-center p-8">
                  {/* Number */}
                  <span className="text-5xl font-bold opacity-20 text-white mb-4 block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${item.color}25` }}>
                    <item.icon className="w-8 h-8" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 5: Flow ═══ */}
      <section id="flow" className="py-24 bg-[var(--marketing-light-gray)]">
        <div className="max-w-3xl mx-auto px-6">
          <FadeInOnScroll>
            <SectionHeader
              title="ご依頼の流れ"
              englishTitle="FLOW"
              accentColor="bg-[var(--marketing-green)]"
            />
          </FadeInOnScroll>

          <StepFlow steps={STEPS} />

          <FadeInOnScroll delay={600}>
            <div className="text-center mt-12">
              <RoundButton href="/register" variant="dark">
                まずはお問い合わせ
              </RoundButton>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ═══ Section 6: Pricing ═══ */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInOnScroll>
            <SectionHeader
              title="料金プラン"
              englishTitle="PRICING"
              accentColor="bg-[var(--marketing-orange)]"
            />
          </FadeInOnScroll>

          <FadeInOnScroll delay={100}>
            <p className="text-center text-sm text-[var(--marketing-dark-gray)] mb-4">
              ※ 全プラン共通で初期設定費用 <strong>¥100,000（税別）</strong> が別途かかります
            </p>
          </FadeInOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 items-stretch">
            {PLANS.map((plan, i) => (
              <FadeInOnScroll key={plan.name} delay={i * 150} className="h-full">
                <div
                  className="relative flex h-full flex-col rounded-2xl bg-white border-2 overflow-hidden transition-all hover:shadow-lg"
                  style={{ borderColor: plan.recommended ? plan.color : "#E5E7EB" }}
                >
                  {/* Top accent */}
                  <div className="h-1.5 shrink-0" style={{ backgroundColor: plan.color }} />

                  {plan.recommended && (
                    <div className="absolute top-4 right-4">
                      <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: plan.color }}>
                        人気
                      </span>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-8">
                    <h3 className="text-xl font-bold text-[var(--marketing-text)] mb-2">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-[var(--marketing-text)]">
                        ¥{plan.yearlyPrice.toLocaleString()}
                      </span>
                      <span className="text-sm text-[var(--marketing-dark-gray)]">/年</span>
                      <div className="text-xs text-[var(--marketing-dark-gray)] mt-1">
                        月額 ¥{plan.monthlyPrice.toLocaleString()}（税別）
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-[var(--marketing-dark-gray)]">
                          <CheckCircle className="w-4 h-4 shrink-0" style={{ color: plan.color }} />
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
            <p className="text-center text-xs text-[var(--marketing-dark-gray)] mt-8">
              スポットオーダー（単発）: ¥50,000（税別）/ 1本もご利用いただけます
            </p>
          </FadeInOnScroll>

          <FadeInOnScroll delay={600}>
            <div className="text-center mt-10">
              <RoundButton href="/price" variant="dark">
                料金の詳細を見る
              </RoundButton>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ═══ Section 7: Works ═══ */}
      <section className="py-24 bg-[var(--marketing-light-gray)]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInOnScroll>
            <SectionHeader
              title="制作実績"
              englishTitle="WORKS"
              accentColor="bg-[var(--marketing-yellow)]"
            />
          </FadeInOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {WORKS.map((work, i) => (
              <FadeInOnScroll key={work.title} delay={i * 100}>
                <div className="group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                  {/* Placeholder image */}
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Image Placeholder</span>
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-medium text-[var(--marketing-dark-gray)] bg-[var(--marketing-light-gray)] px-2 py-1 rounded-full">
                      {work.category}
                    </span>
                    <h3 className="text-sm font-bold text-[var(--marketing-text)] mt-2">{work.title}</h3>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>

          <FadeInOnScroll delay={600}>
            <div className="text-center mt-10">
              <RoundButton href="#" variant="dark">
                実績をもっと見る
              </RoundButton>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ═══ Section 8: News ═══ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeInOnScroll>
            <SectionHeader
              title="お知らせ"
              englishTitle="NEWS"
              accentColor="bg-[var(--marketing-pink)]"
            />
          </FadeInOnScroll>

          <div className="space-y-0 divide-y divide-gray-100">
            {NEWS.map((item, i) => (
              <FadeInOnScroll key={item.title} delay={i * 100}>
                <a href="#" className="flex items-start gap-6 py-5 group hover:bg-gray-50 px-4 -mx-4 rounded-lg transition-colors">
                  <time className="text-sm text-[var(--marketing-dark-gray)] shrink-0 pt-0.5">
                    {item.date}
                  </time>
                  <span className="text-sm text-[var(--marketing-text)] group-hover:text-[var(--marketing-dark-gray)] transition-colors">
                    {item.title}
                  </span>
                </a>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 9: CTA ═══ */}
      <CTABand
        title="まずは無料相談から"
        subtitle="お気軽にお問い合わせください。専任のスタッフがご対応いたします。"
        buttonText="お問い合わせはこちら"
        buttonHref="/register"
      />
    </>
  );
}

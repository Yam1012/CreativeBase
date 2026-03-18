import {
  ServiceHero,
  SectionHeader,
  AlternatingFeature,
  StepFlow,
  CTABand,
  FadeInOnScroll,
} from "@/components/marketing";
import { FAQAccordion } from "@/components/marketing/faq-accordion";
import type { ServiceData } from "@/lib/service-data";

interface ServiceDetailPageProps {
  service: ServiceData;
}

export function ServiceDetailPage({ service }: ServiceDetailPageProps) {
  return (
    <>
      {/* ① ヒーロー — ダークグレー */}
      <ServiceHero
        title={service.title}
        englishTitle={service.englishTitle}
        subtitle={service.subtitle}
        accentColor={service.accentColor}
      />

      {/* ② サービス概要 — 白背景 */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <FadeInOnScroll>
            <p
              className="mx-auto max-w-3xl text-center text-base leading-relaxed sm:text-lg"
              style={{ color: "var(--marketing-text)" }}
            >
              {service.description}
            </p>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ③ 特徴（左右交互）— ライトグレー */}
      <section
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--marketing-light-gray)" }}
      >
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeader
            title="特徴"
            englishTitle="FEATURES"
            accentColor={service.accentColor}
            align="center"
          />

          <div className="mt-16 space-y-16 sm:space-y-24">
            {service.features.map((feature, i) => (
              <AlternatingFeature
                key={feature.number}
                feature={feature}
                index={i}
                accentColor={service.accentColor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ④ 制作フロー — 白背景 */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeader
            title="制作フロー"
            englishTitle="PROCESS"
            accentColor={service.accentColor}
            align="center"
          />

          <div className="mt-14">
            <StepFlow steps={service.process} />
          </div>
        </div>
      </section>

      {/* ⑤ 実績 — ライトグレー */}
      <section
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--marketing-light-gray)" }}
      >
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeader
            title="制作実績"
            englishTitle="WORKS"
            accentColor={service.accentColor}
            align="center"
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <FadeInOnScroll key={n} delay={n * 100}>
                <div
                  className="aspect-[4/3] overflow-hidden rounded-sm border-2"
                  style={{ borderColor: `${service.accentColor}40` }}
                >
                  <div
                    className="flex h-full items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${service.accentColor}10, ${service.accentColor}25)`,
                    }}
                  >
                    <div className="text-center">
                      <div
                        className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${service.accentColor}20` }}
                      >
                        <span
                          className="text-lg font-bold"
                          style={{ color: service.accentColor }}
                        >
                          {String(n).padStart(2, "0")}
                        </span>
                      </div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--marketing-text)", opacity: 0.6 }}
                      >
                        制作実績 {String(n).padStart(2, "0")}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ⑥ FAQ — 白背景 */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeader
            title="よくあるご質問"
            englishTitle="FAQ"
            accentColor={service.accentColor}
            align="center"
          />

          <div className="mt-14">
            <FAQAccordion
              items={service.faq}
              accentColor={service.accentColor}
            />
          </div>
        </div>
      </section>

      {/* ⑦ CTA — グラデーション */}
      <CTABand
        title="まずはお気軽にご相談ください"
        subtitle={`${service.title}に関するお問い合わせ・お見積りはこちら`}
        buttonText="無料で相談する"
        buttonHref="/register"
      />
    </>
  );
}

import { FadeInOnScroll } from "./fade-in-on-scroll";
import type { ServiceFeature } from "@/lib/service-data";

interface AlternatingFeatureProps {
  feature: ServiceFeature;
  index: number;
  accentColor: string;
}

export function AlternatingFeature({
  feature,
  index,
  accentColor,
}: AlternatingFeatureProps) {
  const isEven = index % 2 === 0;

  return (
    <FadeInOnScroll delay={index * 100}>
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
        {/* 画像プレースホルダー */}
        <div className={isEven ? "lg:order-1" : "lg:order-2"}>
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-xl border-2"
            style={{ borderColor: accentColor }}
          >
            {/* グラデーション背景のプレースホルダー */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}30)`,
              }}
            >
              <div className="text-center">
                <div
                  className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${accentColor}25` }}
                >
                  <span
                    className="text-2xl font-bold"
                    style={{ color: accentColor }}
                  >
                    {feature.number}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--marketing-text)" }}>
                  イメージ画像
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* テキスト */}
        <div className={isEven ? "lg:order-2" : "lg:order-1"}>
          <div className="relative">
            {/* 大きなナンバー (装飾) */}
            <span
              className="pointer-events-none absolute -top-8 -left-2 select-none text-7xl font-bold sm:text-8xl"
              style={{ color: accentColor, opacity: 0.1 }}
            >
              {feature.number}
            </span>

            <div className="relative">
              {/* アクセントライン */}
              <div
                className="mb-4 h-1 w-12 rounded-full"
                style={{ backgroundColor: accentColor }}
              />

              <h3
                className="mb-3 text-xl font-bold sm:text-2xl"
                style={{ color: "var(--marketing-text)" }}
              >
                {feature.title}
              </h3>

              <p
                className="text-sm leading-relaxed sm:text-base"
                style={{ color: "var(--marketing-text)", opacity: 0.8 }}
              >
                {feature.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </FadeInOnScroll>
  );
}

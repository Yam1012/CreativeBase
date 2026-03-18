import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ServiceHeroProps {
  title: string;
  englishTitle: string;
  subtitle: string;
  accentColor: string;
}

export function ServiceHero({
  title,
  englishTitle,
  subtitle,
  accentColor,
}: ServiceHeroProps) {
  return (
    <section
      className="relative overflow-hidden py-20 sm:py-28"
      style={{ backgroundColor: "var(--marketing-dark-gray)" }}
    >
      {/* 装飾: アクセントカラーのドット (左上) */}
      <div
        className="absolute top-8 left-8 h-3 w-3 rounded-full opacity-60"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute top-8 left-14 h-2 w-2 rounded-full opacity-40"
        style={{ backgroundColor: accentColor }}
      />

      {/* 装飾: アクセントカラーのライン (右下) */}
      <div
        className="absolute right-0 bottom-12 h-[3px] w-24 opacity-50"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute right-0 bottom-20 h-[2px] w-16 opacity-30"
        style={{ backgroundColor: accentColor }}
      />

      {/* 大きな英語背景テキスト */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <span
          className="marketing-bg-text text-white"
          style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }}
        >
          {englishTitle}
        </span>
      </div>

      <div className="relative mx-auto max-w-5xl px-6">
        {/* パンくずリスト */}
        <nav className="mb-8 flex items-center gap-1.5 text-sm text-white/50">
          <Link
            href="/"
            className="transition-colors hover:text-white/80"
          >
            トップ
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href="/#services"
            className="transition-colors hover:text-white/80"
          >
            サービス
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-white/80">{title}</span>
        </nav>

        {/* タイトル */}
        <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          <span
            className="mr-3 inline-block h-4 w-4 rounded-sm"
            style={{ backgroundColor: accentColor }}
          />
          {title}
        </h1>

        {/* サブテキスト */}
        <p className="max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
          {subtitle}
        </p>
      </div>
    </section>
  );
}

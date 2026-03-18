import { RoundButton } from "./round-button";

interface CTABandProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonHref: string;
}

export function CTABand({ title, subtitle, buttonText, buttonHref }: CTABandProps) {
  return (
    <section className="relative py-20 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "var(--marketing-gradient-cta)" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="text-white/80 mb-8 text-lg">{subtitle}</p>
        )}
        <RoundButton href={buttonHref} variant="outline" size="lg">
          {buttonText}
        </RoundButton>
      </div>
    </section>
  );
}

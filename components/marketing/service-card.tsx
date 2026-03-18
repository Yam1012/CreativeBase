import { FadeInOnScroll } from "./fade-in-on-scroll";

interface ServiceCardProps {
  number: string;
  title: string;
  description: string;
  accentColor?: string;
  delay?: number;
}

export function ServiceCard({
  number,
  title,
  description,
  accentColor = "#FFAFD4",
  delay = 0,
}: ServiceCardProps) {
  return (
    <FadeInOnScroll delay={delay}>
      <div className="relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
        <span
          className="absolute -top-4 -left-2 text-[120px] font-bold leading-none opacity-[0.06] select-none pointer-events-none"
          style={{ color: accentColor }}
        >
          {number}
        </span>

        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative z-10">
          <span className="text-sm font-bold" style={{ color: accentColor }}>
            {number}
          </span>
          <h3 className="text-xl font-bold text-[var(--marketing-text)] mt-2 mb-3">
            {title}
          </h3>
          <p className="text-sm text-[var(--marketing-dark-gray)] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </FadeInOnScroll>
  );
}

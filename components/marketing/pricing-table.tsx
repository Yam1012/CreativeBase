import { FadeInOnScroll } from "./fade-in-on-scroll";

interface PricingItem {
  label: string;
  price: string;
  note?: string;
}

interface PricingTableProps {
  title: string;
  accentColor: string;
  items: PricingItem[];
  delay?: number;
}

export function PricingTable({
  title,
  accentColor,
  items,
  delay = 0,
}: PricingTableProps) {
  return (
    <FadeInOnScroll delay={delay}>
      <div className="h-full overflow-hidden rounded-sm bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* Top accent */}
        <div className="h-1.5" style={{ backgroundColor: accentColor }} />

        <div className="p-6 sm:p-8">
          <h3
            className="mb-6 text-lg font-bold"
            style={{ color: "var(--marketing-text)" }}
          >
            <span
              className="mr-2 inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: accentColor }}
            />
            {title}
          </h3>

          <div className="space-y-0 divide-y divide-gray-100">
            {items.map((item, i) => (
              <div key={i} className="flex items-baseline justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <span
                    className="text-sm"
                    style={{ color: "var(--marketing-text)" }}
                  >
                    {item.label}
                  </span>
                  {item.note && (
                    <span className="ml-2 text-xs text-[var(--marketing-dark-gray)]">
                      {item.note}
                    </span>
                  )}
                </div>
                <span
                  className="shrink-0 text-right text-base font-bold"
                  style={{ color: "var(--marketing-text)" }}
                >
                  {item.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeInOnScroll>
  );
}

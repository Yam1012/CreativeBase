"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ServiceFAQ } from "@/lib/service-data";

interface FAQAccordionProps {
  items: ServiceFAQ[];
  accentColor: string;
}

export function FAQAccordion({ items, accentColor }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i;

        return (
          <div
            key={i}
            className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Question */}
            <button
              onClick={() => toggle(i)}
              className="flex w-full items-center gap-4 px-6 py-5 text-left transition-colors"
              style={{
                borderLeft: `4px solid ${isOpen ? accentColor : "transparent"}`,
              }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: accentColor }}
              >
                Q
              </span>
              <span
                className="flex-1 text-sm font-semibold sm:text-base"
                style={{ color: "var(--marketing-text)" }}
              >
                {item.question}
              </span>
              <ChevronDown
                className="h-5 w-5 shrink-0 transition-transform duration-300"
                style={{
                  color: accentColor,
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* Answer */}
            <div
              className="transition-all duration-300 ease-in-out"
              style={{
                maxHeight: isOpen ? "500px" : "0",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="flex gap-4 px-6 pb-5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: `${accentColor}15`,
                    color: accentColor,
                  }}
                >
                  A
                </span>
                <p
                  className="pt-1 text-sm leading-relaxed sm:text-base"
                  style={{ color: "var(--marketing-text)", opacity: 0.8 }}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

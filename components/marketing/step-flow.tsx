import { cn } from "@/lib/utils";
import { FadeInOnScroll } from "./fade-in-on-scroll";

interface Step {
  number: string;
  title: string;
  description: string;
}

interface StepFlowProps {
  steps: Step[];
}

export function StepFlow({ steps }: StepFlowProps) {
  return (
    <div className="relative">
      <div className="hidden md:block absolute left-8 top-0 bottom-0 w-px bg-[var(--marketing-accent-blue)]" style={{ opacity: 0.3 }} />

      <div className="space-y-10">
        {steps.map((step, i) => (
          <FadeInOnScroll key={step.number} delay={i * 150}>
            <div className="flex gap-6 items-start">
              <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-[#212121] to-[#007AFF] flex items-center justify-center text-white text-lg font-bold shadow-lg shrink-0">
                {step.number}
              </div>

              <div className={cn("pt-3", i < steps.length - 1 && "pb-2")}>
                <h3 className="text-lg font-bold text-[var(--marketing-text)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--marketing-dark-gray)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </FadeInOnScroll>
        ))}
      </div>
    </div>
  );
}

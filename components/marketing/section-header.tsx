import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  englishTitle: string;
  accentColor?: string;
  align?: "left" | "center";
  darkBg?: boolean;
}

export function SectionHeader({
  title,
  englishTitle,
  accentColor = "#007AFF",
  align = "center",
  darkBg = false,
}: SectionHeaderProps) {
  return (
    <div className={cn("relative mb-12", align === "center" && "text-center")}>
      <span
        className={cn(
          "marketing-bg-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          darkBg ? "text-white" : "text-[var(--marketing-dark-gray)]"
        )}
      >
        {englishTitle}
      </span>

      <div className={cn("relative z-10", align === "center" && "flex flex-col items-center")}>
        <div className="w-4 h-4 mb-4" style={{ backgroundColor: accentColor }} />
        <h2
          className={cn(
            "text-[var(--marketing-h2-size)] font-bold leading-tight",
            darkBg ? "text-white" : "text-[var(--marketing-text)]"
          )}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}

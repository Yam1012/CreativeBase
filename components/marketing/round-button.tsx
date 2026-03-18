import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface RoundButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "pink" | "purple" | "cyan" | "green" | "outline";
  size?: "default" | "lg";
  className?: string;
}

const variantStyles = {
  dark: "bg-[var(--marketing-dark-gray)] text-white hover:opacity-90",
  pink: "bg-[var(--marketing-pink)] text-[var(--marketing-text)] hover:opacity-90",
  purple: "bg-[var(--marketing-purple)] text-[var(--marketing-text)] hover:opacity-90",
  cyan: "bg-[var(--marketing-cyan)] text-[var(--marketing-text)] hover:opacity-90",
  green: "bg-[var(--marketing-green)] text-[var(--marketing-text)] hover:opacity-90",
  outline: "border-2 border-white text-white hover:bg-white/10",
};

export function RoundButton({
  href,
  children,
  variant = "dark",
  size = "default",
  className,
}: RoundButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 font-medium transition-all",
        "rounded-[var(--marketing-btn-radius)]",
        size === "default" ? "px-8 py-3 text-sm" : "px-10 py-4 text-base",
        variantStyles[variant],
        className
      )}
    >
      {children}
      <ChevronRight className="w-4 h-4" />
    </Link>
  );
}

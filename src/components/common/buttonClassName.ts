import { cn } from "../../utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

const variantClassName: Record<ButtonVariant, string> = {
  primary: "bg-loop-600 text-white shadow-sm hover:bg-loop-700",
  secondary:
    "bg-white text-loop-700 shadow-sm ring-1 ring-loop-100 hover:bg-loop-50",
  ghost: "bg-transparent text-ink-700 hover:bg-slate-100",
  outline: "bg-white text-ink-900 ring-1 ring-slate-200 hover:bg-slate-50",
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
    variantClassName[variant],
    sizeClassName[size],
    className,
  );
}

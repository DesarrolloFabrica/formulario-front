import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnswerCardProps {
  children: React.ReactNode;
  control: React.ReactNode;
  selected: boolean;
  disabled?: boolean;
}

export function AnswerCard({
  children,
  control,
  selected,
  disabled = false,
}: AnswerCardProps) {
  return (
    <label
      className={cn(
        "group relative flex min-h-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border bg-surface px-6 py-8 text-center shadow-sm transition-all duration-200",
        "border-border hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-hover hover:shadow-glow",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-panel",
        selected &&
          "border-accent bg-surface-selected shadow-glow ring-1 ring-accent/40",
        disabled && "cursor-not-allowed opacity-50 hover:translate-y-0 hover:shadow-sm"
      )}
    >
      <span className="absolute right-3 top-3">{control}</span>
      <span className="max-w-prose text-sm font-medium leading-relaxed text-foreground sm:text-base">
        {children}
      </span>
      {selected ? (
        <span className="absolute bottom-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm">
          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
          <span className="sr-only">Seleccionada</span>
        </span>
      ) : null}
    </label>
  );
}

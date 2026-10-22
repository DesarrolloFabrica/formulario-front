import { cn } from "@/lib/utils";

interface AnswerGridProps {
  children: React.ReactNode;
  className?: string;
}

export function AnswerGrid({ children, className }: AnswerGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      {children}
    </div>
  );
}

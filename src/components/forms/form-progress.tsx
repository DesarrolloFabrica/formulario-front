import { Progress } from "@/components/ui/progress";

interface FormProgressProps {
  current: number;
  total: number;
}

export function FormProgress({ current, total }: FormProgressProps) {
  const percent = total === 0 ? 0 : Math.round((current / total) * 100);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-muted">Tu progreso</span>
        <span className="tabular-nums text-foreground">
          {current} de {total}
        </span>
      </div>
      <Progress
        value={percent}
        aria-label={`Paso ${current} de ${total}`}
        className="h-1.5 bg-accent-soft"
      />
    </div>
  );
}

import { LoaderCircle } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Cargando…" }: LoadingStateProps) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3 bg-app text-muted"
      role="status"
      aria-live="polite"
    >
      <LoaderCircle className="h-8 w-8 animate-spin text-lavender" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

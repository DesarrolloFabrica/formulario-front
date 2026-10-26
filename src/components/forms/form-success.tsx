import { CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FormSuccessProps {
  submissionId: string;
  message: string;
}

export function FormSuccess({
  submissionId,
  message,
}: FormSuccessProps) {
  return (
    <Card className="mx-auto max-w-2xl border-accent/60 bg-panel/95 shadow-glow">
      <CardHeader className="items-center text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft ring-1 ring-accent/50">
          <CheckCircle2 className="h-12 w-12 text-lavender" aria-hidden />
        </span>
        <CardTitle className="font-display text-2xl">
          Formulario enviado
        </CardTitle>
        <CardDescription className="max-w-md text-base">
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-xs text-muted">
          Referencia del intento: <code>{submissionId}</code>
        </p>
      </CardContent>
    </Card>
  );
}

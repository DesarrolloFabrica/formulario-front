import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  onReset: () => void;
}

export function FormSuccess({
  submissionId,
  message,
  onReset,
}: FormSuccessProps) {
  return (
    <Card className="mx-auto max-w-2xl border-teal-200 bg-white">
      <CardHeader className="items-center text-center">
        <CheckCircle2 className="h-12 w-12 text-teal-700" aria-hidden />
        <CardTitle className="font-display text-2xl">
          Formulario enviado
        </CardTitle>
        <CardDescription className="max-w-md text-base">
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Esta es una simulación de demostración. Los datos no se guardaron en
          un servidor.
        </p>
        <p className="text-xs text-slate-500">
          Referencia simulada: <code>{submissionId}</code>
        </p>
        <Button type="button" variant="outline" onClick={onReset}>
          Volver al formulario
        </Button>
      </CardContent>
    </Card>
  );
}

import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  disabled?: boolean;
}

export function FormActions({ isSubmitting, disabled }: FormActionsProps) {
  return (
    <div className="sticky bottom-0 -mx-4 border-t border-border bg-panel/95 px-4 py-4 backdrop-blur sm:-mx-0 sm:rounded-b-xl sm:px-0">
      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        disabled={isSubmitting || disabled}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Enviando…
          </>
        ) : (
          "Enviar formulario"
        )}
      </Button>
    </div>
  );
}

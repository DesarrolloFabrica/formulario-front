import { ArrowLeft, ArrowRight, LoaderCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormProgress } from "@/components/forms/form-progress";

interface FormNavigationProps {
  current: number;
  total: number;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function FormNavigation({
  current,
  total,
  isSubmitting,
  onPrevious,
  onNext,
}: FormNavigationProps) {
  const isFirst = current === 1;
  const isLast = current === total;

  return (
    <div className="space-y-5 border-t border-slate-200 pt-6">
      <FormProgress current={current} total={total} />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onPrevious}
          disabled={isFirst || isSubmitting}
          className="w-full rounded-xl sm:w-auto sm:min-w-28"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Anterior
        </Button>

        {isLast ? (
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-teal-700 hover:bg-teal-800 sm:w-auto sm:min-w-44"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                Enviando…
              </>
            ) : (
              <>
                Finalizar formulario
                <Send className="h-4 w-4" aria-hidden />
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            onClick={onNext}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-teal-700 hover:bg-teal-800 sm:w-auto sm:min-w-32"
          >
            Siguiente
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}

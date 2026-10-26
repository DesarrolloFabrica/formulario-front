"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, CloudCheck, LoaderCircle } from "lucide-react";
import {
  FormProvider,
  useForm,
  type FieldErrors,
  type FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AuthUser } from "@/types/auth";
import type { FormAnswerValue, FormAnswers, FormConfig } from "@/types/forms";
import {
  buildDefaultValues,
  buildFormSchema,
} from "@/lib/form-schema";
import { formService } from "@/services/form-service";
import { QuestionStep } from "@/components/forms/question-step";
import { FormAvatar } from "@/components/forms/form-avatar";
import { FormNavigation } from "@/components/forms/form-navigation";
import { FormSuccess } from "@/components/forms/form-success";

interface DynamicFormProps {
  config: FormConfig;
  user: AuthUser;
}

export function DynamicForm({ config: rawConfig, user }: DynamicFormProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [now, setNow] = useState(() => Date.now());
  const [success, setSuccess] = useState<{
    submissionId: string;
    message: string;
  } | null>(null);
  // El backend ya entrega un orden aleatorio, estable por intento.
  const config = rawConfig;
  const schema = useMemo(() => buildFormSchema(config), [config]);
  const defaultValues = useMemo(() => ({ ...buildDefaultValues(config), ...config.initialAnswers }), [config]);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
    shouldUnregister: false,
  });

  const {
    handleSubmit,
    trigger,
    subscribe,
    getValues,
    formState: { isSubmitting, isDirty },
  } = methods;

  useEffect(() => {
    if (!config.expiresAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [config.expiresAt]);

  useEffect(() => {
    const timers = new Map<string, number>();
    const previous = new Map(config.questions.map((question) => [question.id, JSON.stringify(getValues(question.id))]));
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        for (const question of config.questions) {
          const value = values[question.id] as FormAnswerValue;
          const serialized = JSON.stringify(value);
          if (previous.get(question.id) === serialized) continue;
          previous.set(question.id, serialized);
          const current = timers.get(question.id);
          if (current) window.clearTimeout(current);
          setSaveStatus("saving");
          timers.set(question.id, window.setTimeout(async () => {
            try {
              await formService.saveAnswer(config.roleId, question.id, value);
              setSaveStatus("saved");
            } catch {
              setSaveStatus("error");
            }
          }, 700));
        }
      },
    });
    return () => {
      unsubscribe();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [config.questions, config.roleId, getValues, subscribe]);

  const activeQuestion = config.questions[activeIndex];
  const activeSection = config.sections.find(
    (section) => section.id === activeQuestion?.sectionId
  );
  const total = config.questions.length;
  const remainingMs = config.expiresAt ? Math.max(0, new Date(config.expiresAt).getTime() - now) : null;

  useEffect(() => {
    if (!isDirty || success) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, success]);

  useEffect(() => {
    if (!activeQuestion) return;

    window.requestAnimationFrame(() => {
      document.getElementById(`${activeQuestion.id}-title`)?.focus?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [activeIndex, activeQuestion]);

  const goToQuestion = (index: number) => {
    setActiveIndex(Math.min(Math.max(index, 0), total - 1));
    setSubmitError(null);
  };

  const handleNext = async () => {
    if (!activeQuestion) return;
    const isValid = await trigger(activeQuestion.id, { shouldFocus: true });
    if (isValid) {
      setSaveStatus("saving");
      try {
        await formService.saveAnswer(config.roleId, activeQuestion.id, getValues(activeQuestion.id) as FormAnswerValue);
        setSaveStatus("saved");
        goToQuestion(activeIndex + 1);
      } catch {
        setSaveStatus("error");
        setSubmitError("No pudimos guardar esta respuesta. Revisa tu conexión e inténtalo otra vez.");
      }
    }
  };

  const submitValues = async (values: FieldValues) => {
    setSubmitError(null);
    const result = await formService.submit({
      roleId: config.roleId,
      userId: user.id,
      answers: values as FormAnswers,
      submittedAt: new Date().toISOString(),
    });

    if (!result.success) {
      setSubmitError(result.message);
      return;
    }

    setSuccess({
      submissionId: result.submissionId,
      message: result.message,
    });
  };

  const handleInvalid = (errors: FieldErrors<FieldValues>) => {
    const firstInvalidIndex = config.questions.findIndex(
      (question) => errors[question.id]
    );
    if (firstInvalidIndex >= 0) goToQuestion(firstInvalidIndex);
  };

  if (success) {
    return (
      <FormSuccess
        submissionId={success.submissionId}
        message={success.message}
      />
    );
  }

  if (!activeQuestion) {
    return (
      <p className="rounded-2xl border border-warning-border bg-warning-surface p-6 text-warning">
        Este formulario todavía no tiene preguntas configuradas.
      </p>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(submitValues, handleInvalid)}
        className="space-y-5"
        noValidate
      >
        <div className="px-1">
          <p className="text-sm font-semibold text-lavender">{config.title}</p>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">
            {config.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            {remainingMs !== null ? <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 font-medium text-foreground"><Clock3 className="h-3.5 w-3.5 text-lavender" />Tiempo restante: {formatRemaining(remainingMs)}</span> : null}
            {saveStatus === "saving" ? <span className="flex items-center gap-1.5 text-muted"><LoaderCircle className="h-3.5 w-3.5 animate-spin" />Guardando…</span> : null}
            {saveStatus === "saved" ? <span className="flex items-center gap-1.5 text-muted"><CloudCheck className="h-3.5 w-3.5 text-lavender" />Respuesta guardada</span> : null}
            {saveStatus === "error" ? <span className="text-danger-foreground">No se pudo guardar</span> : null}
          </div>
        </div>

        <div className="grid items-start gap-5 md:grid-cols-[minmax(0,3fr)_minmax(13rem,1fr)] lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)] lg:gap-8">
          <div className="min-w-0 p-5 sm:p-8 md:pr-6 lg:p-10 lg:pr-8">
            <QuestionStep
              question={activeQuestion}
              current={activeIndex + 1}
              total={total}
              sectionTitle={activeSection?.title}
            />

            {submitError ? (
              <p
                className="mt-6 rounded-xl border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger-foreground"
                role="alert"
              >
                {submitError}
              </p>
            ) : null}

            <div className="mt-8">
              <FormNavigation
                current={activeIndex + 1}
                total={total}
                isSubmitting={isSubmitting}
                onPrevious={() => goToQuestion(activeIndex - 1)}
                onNext={handleNext}
              />
            </div>
          </div>

          <div className="sticky top-6 hidden md:block">
            <FormAvatar
              questionNumber={activeIndex + 1}
              roleId={config.roleId}
            />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

function formatRemaining(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1_000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return days > 0
    ? `${days} d ${hours} h ${minutes} min`
    : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

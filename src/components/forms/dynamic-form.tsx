"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  FormProvider,
  useForm,
  type FieldErrors,
  type FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AuthUser } from "@/types/auth";
import type { FormAnswers, FormConfig } from "@/types/forms";
import {
  buildDefaultValues,
  buildFormSchema,
  withShuffledOptions,
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
  const [success, setSuccess] = useState<{
    submissionId: string;
    message: string;
  } | null>(null);
  const shuffleId = useId();

  const config = useMemo(
    () => withShuffledOptions(rawConfig, `${user.id}:${shuffleId}`),
    [rawConfig, shuffleId, user.id]
  );
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
    formState: { isSubmitting, isDirty },
  } = methods;

  const activeQuestion = config.questions[activeIndex];
  const activeSection = config.sections.find(
    (section) => section.id === activeQuestion?.sectionId
  );
  const total = config.questions.length;

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
    if (isValid) goToQuestion(activeIndex + 1);
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
        </div>

        <div className="grid items-start gap-5 md:grid-cols-[minmax(0,3fr)_minmax(13rem,1fr)] lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)]">
          <div className="min-w-0 rounded-[2rem] border border-border bg-panel/95 p-5 shadow-card backdrop-blur-sm sm:p-8 lg:p-10">
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

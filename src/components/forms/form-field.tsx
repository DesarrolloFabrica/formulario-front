"use client";

import { Controller, useFormContext, type FieldValues } from "react-hook-form";
import { ArrowDown, ArrowUp, CircleX, GripVertical, RotateCcw } from "lucide-react";
import type { FormQuestion } from "@/types/forms";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AnswerCard } from "@/components/forms/answer-card";
import { AnswerGrid } from "@/components/forms/answer-grid";

interface FormFieldProps {
  question: FormQuestion;
}

function findErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  for (const value of Object.values(error)) {
    const message = findErrorMessage(value);
    if (message) return message;
  }

  return undefined;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      className="rounded-xl border border-danger-border bg-danger-surface px-4 py-3 text-sm font-medium text-danger-foreground"
      role="alert"
    >
      {message}
    </p>
  );
}

function OptionText({ label }: { label: string }) {
  return <>{label}</>;
}

export function FormField({ question }: FormFieldProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<FieldValues>();

  const errorMessage = findErrorMessage(errors[question.id]);
  const errorId = `${question.id}-error`;
  const describedBy = [
    question.helpText ? `${question.id}-help` : null,
    errorMessage ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  const fieldShell = "space-y-4";
  const inputClassName =
    "h-14 rounded-xl px-4 text-base shadow-sm";

  switch (question.type) {
    case "text":
      return (
        <div className={fieldShell}>
          <Input
            id={question.id}
            aria-labelledby={`${question.id}-title`}
            aria-describedby={describedBy}
            aria-invalid={Boolean(errorMessage)}
            className={inputClassName}
            placeholder="Escribe tu respuesta"
            {...register(question.id)}
          />
          <FieldError id={errorId} message={errorMessage} />
        </div>
      );

    case "textarea":
      return (
        <div className={fieldShell}>
          <Textarea
            id={question.id}
            aria-labelledby={`${question.id}-title`}
            aria-describedby={describedBy}
            aria-invalid={Boolean(errorMessage)}
            className="min-h-44 rounded-xl p-4 text-base shadow-sm"
            placeholder="Escribe tu respuesta"
            {...register(question.id)}
          />
          <FieldError id={errorId} message={errorMessage} />
        </div>
      );

    case "number":
      return (
        <div className={fieldShell}>
          <Input
            id={question.id}
            type="number"
            aria-labelledby={`${question.id}-title`}
            aria-describedby={describedBy}
            aria-invalid={Boolean(errorMessage)}
            className={inputClassName}
            placeholder="Ingresa un número"
            {...register(question.id, {
              setValueAs: (value) => (value === "" ? undefined : value),
            })}
          />
          <FieldError id={errorId} message={errorMessage} />
        </div>
      );

    case "date":
      return (
        <div className={fieldShell}>
          <Input
            id={question.id}
            type="date"
            aria-labelledby={`${question.id}-title`}
            aria-describedby={describedBy}
            aria-invalid={Boolean(errorMessage)}
            className={inputClassName}
            {...register(question.id)}
          />
          <FieldError id={errorId} message={errorMessage} />
        </div>
      );

    case "single_choice":
      return (
        <div className={fieldShell}>
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? ""}
                onValueChange={field.onChange}
                aria-labelledby={`${question.id}-title`}
                aria-describedby={describedBy}
              >
                <AnswerGrid>
                  {(question.options ?? []).map((option) => (
                    <AnswerCard
                      key={option.id}
                      selected={field.value === option.id}
                      control={
                        <RadioGroupItem
                          value={option.id}
                          id={`${question.id}-${option.id}`}
                          aria-label={option.label}
                          className="h-5 w-5"
                        />
                      }
                    >
                      <OptionText label={option.label} />
                    </AnswerCard>
                  ))}
                </AnswerGrid>
              </RadioGroup>
            )}
          />
          <FieldError id={errorId} message={errorMessage} />
        </div>
      );

    case "multi_choice":
      return (
        <div className={fieldShell}>
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => {
              const selected: string[] = Array.isArray(field.value)
                ? field.value
                : [];
              return (
                <AnswerGrid
                  className="items-stretch"
                >
                  {(question.options ?? []).map((option) => {
                    const checked = selected.includes(option.id);
                    return (
                      <AnswerCard
                        key={option.id}
                        selected={checked}
                        control={
                          <Checkbox
                            checked={checked}
                            aria-label={option.label}
                            onCheckedChange={(state) => {
                              const next =
                                state === true
                                  ? [...selected, option.id]
                                  : selected.filter((id) => id !== option.id);
                              field.onChange(next);
                            }}
                            className="h-5 w-5"
                          />
                        }
                      >
                        <OptionText label={option.label} />
                      </AnswerCard>
                    );
                  })}
                </AnswerGrid>
              );
            }}
          />
          <FieldError id={errorId} message={errorMessage} />
        </div>
      );

    case "classification":
      return (
        <div className={fieldShell}>
          {(question.classificationCategories?.length ?? 0) > 0 ? (
            <div className="rounded-xl border border-border bg-accent-soft/55 p-4 text-sm text-muted">
              <p className="mb-2 font-semibold text-foreground">Categorías</p>
              <ul className="space-y-1.5">
                {(question.classificationCategories ?? []).map((category) => (
                  <li key={category.id}>
                    {category.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="grid gap-3">
            {(question.classificationItems ?? []).map((item) => (
              <Controller
                key={item.id}
                name={`${question.id}.${item.id}`}
                control={control}
                render={({ field }) => (
                  <div className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_minmax(17rem,20rem)] sm:items-center lg:grid-cols-[minmax(0,1fr)_minmax(20rem,22rem)]">
                    <p className="min-w-0 break-words text-sm leading-relaxed text-foreground">
                      {item.label}
                    </p>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        aria-label={`Clasificación para ítem ${item.id}`}
                        className="h-auto min-h-12 w-full gap-3 py-2.5 text-left [&>span]:min-w-0 [&>span]:whitespace-normal [&>span]:break-words [&>span]:leading-snug [&>svg]:shrink-0"
                      >
                        <SelectValue placeholder="Selecciona categoría" />
                      </SelectTrigger>
                      <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)]">
                        {(question.classificationCategories ?? []).map(
                          (category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                              className="py-2 pr-3 leading-snug"
                            >
                              {category.label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            ))}
          </div>
          <FieldError id={errorId} message={errorMessage} />
        </div>
      );

    case "ordering":
      return (
        <div className={fieldShell}>
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => {
              const answer = field.value && !Array.isArray(field.value)
                ? field.value as { order: string[]; excluded: string[] }
                : { order: (question.options ?? []).map((option) => option.id), excluded: [] };
              const order = answer.order;
              const byId = new Map(
                (question.options ?? []).map((option) => [option.id, option])
              );

              const move = (index: number, direction: -1 | 1) => {
                const next = [...order];
                const target = index + direction;
                if (target < 0 || target >= next.length) return;
                [next[index], next[target]] = [next[target], next[index]];
                field.onChange({ ...answer, order: next });
              };

              const toggleExcluded = (id: string, shouldExclude: boolean) => {
                field.onChange(shouldExclude
                  ? {
                      order: order.filter((value) => value !== id),
                      excluded: [...new Set([...answer.excluded, id])],
                    }
                  : {
                      order: [...order, id],
                      excluded: answer.excluded.filter((value) => value !== id),
                    });
              };

              const visibleOptions = [
                ...order.map((id) => ({ id, excluded: false })),
                ...answer.excluded.map((id) => ({ id, excluded: true })),
              ];

              return (
                <div aria-describedby={describedBy}>
                <ol className="space-y-3">
                  {visibleOptions.map(({ id, excluded }, index) => {
                    const option = byId.get(id);
                    if (!option) return null;
                    const activeIndex = excluded ? -1 : index;
                    return (
                      <li
                        key={id}
                        className={excluded
                          ? "flex flex-wrap items-center gap-3 rounded-xl border border-danger-border/70 bg-danger-surface/35 p-3 shadow-sm sm:p-4"
                          : "flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm sm:p-4"}
                      >
                        <GripVertical
                          className={excluded
                            ? "hidden h-5 w-5 shrink-0 text-subtle/40 sm:block"
                            : "hidden h-5 w-5 shrink-0 text-subtle sm:block"}
                          aria-hidden
                        />
                        <span className={excluded
                          ? "flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-danger-surface px-2 text-danger-foreground"
                          : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-lavender"}
                        >
                          {excluded ? <CircleX className="h-4 w-4" aria-hidden /> : activeIndex + 1}
                        </span>
                        <p className={excluded
                          ? "min-w-[12rem] flex-1 text-sm leading-relaxed text-muted line-through decoration-danger-foreground/60"
                          : "min-w-[12rem] flex-1 text-sm leading-relaxed text-foreground"}
                        >
                          <OptionText label={option.label} />
                        </p>
                        {excluded ? (
                          <span className="rounded-full border border-danger-border bg-danger-surface px-2.5 py-1 text-xs font-semibold text-danger-foreground">
                            Excluida
                          </span>
                        ) : null}
                        <div className="ml-auto flex shrink-0 gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label={`Subir ${option.id}`}
                            disabled={excluded || activeIndex === 0}
                            onClick={() => move(activeIndex, -1)}
                          >
                            <ArrowUp className="h-4 w-4" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label={`Bajar ${option.id}`}
                            disabled={excluded || activeIndex === order.length - 1}
                            onClick={() => move(activeIndex, 1)}
                          >
                            <ArrowDown className="h-4 w-4" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            aria-label={`${excluded ? "Restaurar" : "Excluir"} ${option.id}`}
                            onClick={() => toggleExcluded(id, !excluded)}
                            className={excluded
                              ? "ml-1 border-accent/70 bg-accent-soft text-foreground hover:bg-surface-hover"
                              : "ml-1 border-danger-border bg-danger-surface/30 text-danger-foreground hover:bg-danger-surface"}
                          >
                            {excluded
                              ? <RotateCcw className="h-4 w-4" aria-hidden />
                              : <CircleX className="h-4 w-4" aria-hidden />}
                            {excluded ? "Restaurar" : "Excluir"}
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                </div>
              );
            }}
          />
          <FieldError id={errorId} message={errorMessage} />
        </div>
      );

    case "decision_two_level":
      return (
        <div className="space-y-7">
          <Controller
            name={`${question.id}.action`}
            control={control}
            render={({ field }) => (
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-muted">
                  Acción
                </legend>
                <RadioGroup
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  aria-label="Acción"
                >
                  <AnswerGrid>
                    {(question.actions ?? []).map((option) => (
                      <AnswerCard
                        key={option.id}
                        selected={field.value === option.id}
                        control={
                          <RadioGroupItem
                            value={option.id}
                            aria-label={option.label}
                            className="h-5 w-5"
                          />
                        }
                      >
                        <OptionText label={option.label} />
                      </AnswerCard>
                    ))}
                  </AnswerGrid>
                </RadioGroup>
              </fieldset>
            )}
          />
          <Controller
            name={`${question.id}.reason`}
            control={control}
            render={({ field }) => (
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-muted">
                  Razón
                </legend>
                <RadioGroup
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  aria-label="Razón"
                >
                  <AnswerGrid>
                    {(question.reasons ?? []).map((option) => (
                      <AnswerCard
                        key={option.id}
                        selected={field.value === option.id}
                        control={
                          <RadioGroupItem
                            value={option.id}
                            aria-label={option.label}
                            className="h-5 w-5"
                          />
                        }
                      >
                        <OptionText label={option.label} />
                      </AnswerCard>
                    ))}
                  </AnswerGrid>
                </RadioGroup>
              </fieldset>
            )}
          />
          <FieldError id={errorId} message={errorMessage} />
        </div>
      );

    default: {
      const exhaustive: never = question.type;
      return exhaustive;
    }
  }
}

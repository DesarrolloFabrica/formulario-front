"use client";

import { Controller, useFormContext, type FieldValues } from "react-hook-form";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
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
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
      role="alert"
    >
      {message}
    </p>
  );
}

function OptionText({ id, label }: { id: string; label: string }) {
  return (
    <>
      <span className="mr-1 font-semibold text-teal-800">{id})</span>
      {label}
    </>
  );
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
    "h-14 rounded-xl border-slate-300 px-4 text-base shadow-sm focus-visible:ring-teal-600";

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
            className="min-h-44 rounded-xl border-slate-300 p-4 text-base shadow-sm focus-visible:ring-teal-600"
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
                          className="h-5 w-5 border-slate-400 bg-white data-[state=checked]:border-teal-700 data-[state=checked]:text-teal-700"
                        />
                      }
                    >
                      <OptionText id={option.id} label={option.label} />
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
                            className="h-5 w-5 data-[state=checked]:border-teal-700 data-[state=checked]:bg-teal-700"
                          />
                        }
                      >
                        <OptionText id={option.id} label={option.label} />
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
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="mb-2 font-semibold text-slate-800">Categorías</p>
              <ul className="space-y-1.5">
                {(question.classificationCategories ?? []).map((category) => (
                  <li key={category.id}>
                    <span className="font-semibold text-teal-800">
                      {category.id})
                    </span>{" "}
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
                  <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_15rem] sm:items-center">
                    <p className="text-sm leading-relaxed text-slate-800">
                      <span className="mr-1 font-semibold text-teal-800">
                        {item.id})
                      </span>
                      {item.label}
                    </p>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        aria-label={`Clasificación para ítem ${item.id}`}
                        className="w-full"
                      >
                        <SelectValue placeholder="Selecciona categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {(question.classificationCategories ?? []).map(
                          (category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.id}) {category.label}
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
              const order: string[] = Array.isArray(field.value)
                ? field.value
                : (question.options ?? []).map((option) => option.id);
              const byId = new Map(
                (question.options ?? []).map((option) => [option.id, option])
              );

              const move = (index: number, direction: -1 | 1) => {
                const next = [...order];
                const target = index + direction;
                if (target < 0 || target >= next.length) return;
                [next[index], next[target]] = [next[target], next[index]];
                field.onChange(next);
              };

              return (
                <ol className="space-y-3" aria-describedby={describedBy}>
                  {order.map((id, index) => {
                    const option = byId.get(id);
                    if (!option) return null;
                    return (
                      <li
                        key={id}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
                      >
                        <GripVertical
                          className="hidden h-5 w-5 shrink-0 text-slate-300 sm:block"
                          aria-hidden
                        />
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-800">
                          {index + 1}
                        </span>
                        <p className="flex-1 text-sm leading-relaxed text-slate-800">
                          <OptionText id={option.id} label={option.label} />
                        </p>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label={`Subir ${option.id}`}
                            disabled={index === 0}
                            onClick={() => move(index, -1)}
                          >
                            <ArrowUp className="h-4 w-4" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label={`Bajar ${option.id}`}
                            disabled={index === order.length - 1}
                            onClick={() => move(index, 1)}
                          >
                            <ArrowDown className="h-4 w-4" aria-hidden />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
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
                <legend className="text-sm font-semibold text-slate-700">
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
                            className="h-5 w-5 data-[state=checked]:border-teal-700 data-[state=checked]:text-teal-700"
                          />
                        }
                      >
                        <OptionText id={option.id} label={option.label} />
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
                <legend className="text-sm font-semibold text-slate-700">
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
                            className="h-5 w-5 data-[state=checked]:border-teal-700 data-[state=checked]:text-teal-700"
                          />
                        }
                      >
                        <OptionText id={option.id} label={option.label} />
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

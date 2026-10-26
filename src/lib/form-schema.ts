import { z } from "zod";
import type { FormConfig, FormQuestion } from "@/types/forms";

function questionSchema(question: FormQuestion): z.ZodTypeAny {
  switch (question.type) {
    case "text":
    case "textarea":
    case "date":
    case "single_choice": {
      const base = z.string();
      return question.required
        ? base.min(1, "Este campo es obligatorio")
        : base.optional();
    }
    case "number": {
      const base = z.coerce.number().refine((n) => !Number.isNaN(n), {
        message: "Ingresa un número válido",
      });
      return question.required ? base : base.optional();
    }
    case "multi_choice": {
      const base = z.array(z.string());
      return question.required
        ? base.min(1, "Selecciona al menos una opción")
        : base.optional();
    }
    case "classification": {
      const items = question.classificationItems ?? [];
      const shape: Record<string, z.ZodTypeAny> = {};
      for (const item of items) {
        shape[item.id] = question.required
          ? z.string().min(1, "Selecciona una categoría")
          : z.string().optional();
      }
      return z.object(shape);
    }
    case "ordering": {
      const count = question.options?.length ?? 0;
      return z.object({ order: z.array(z.string()), excluded: z.array(z.string()) })
        .refine(({ order, excluded }) => order.length + excluded.length === count, {
          message: "Ordena o excluye todas las opciones",
        });
    }
    case "decision_two_level": {
      return z.object({
        action: question.required
          ? z.string().min(1, "Selecciona una acción")
          : z.string().optional(),
        reason: question.required
          ? z.string().min(1, "Selecciona una razón")
          : z.string().optional(),
      });
    }
    default: {
      const _exhaustive: never = question.type;
      return _exhaustive;
    }
  }
}

export function buildFormSchema(config: FormConfig) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const question of config.questions) {
    shape[question.id] = questionSchema(question);
  }
  return z.object(shape);
}

export function buildDefaultValues(
  config: FormConfig
): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  for (const question of config.questions) {
    switch (question.type) {
      case "multi_choice":
        values[question.id] = [];
        break;
      case "classification": {
        const map: Record<string, string> = {};
        for (const item of question.classificationItems ?? []) {
          map[item.id] = "";
        }
        values[question.id] = map;
        break;
      }
      case "ordering":
        values[question.id] = { order: (question.options ?? []).map((o) => o.id), excluded: [] };
        break;
      case "decision_two_level":
        values[question.id] = { action: "", reason: "" };
        break;
      case "number":
        values[question.id] = undefined;
        break;
      case "text":
      case "textarea":
      case "date":
      case "single_choice":
        values[question.id] = "";
        break;
      default: {
        const _exhaustive: never = question.type;
        void _exhaustive;
        break;
      }
    }
  }

  return values;
}

/** Fisher–Yates shuffle (copia superficial). */
export function shuffleArray<T>(
  items: T[],
  random: () => number = Math.random
): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function seededRandom(seed: string): () => number {
  let state = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function withShuffledOptions(
  config: FormConfig,
  stableSeed?: string
): FormConfig {
  return {
    ...config,
    questions: config.questions.map((question) => {
      const random = stableSeed
        ? seededRandom(`${stableSeed}:${question.id}`)
        : Math.random;
      if (
        question.type === "single_choice" ||
        question.type === "multi_choice"
      ) {
        return {
          ...question,
          options: shuffleArray(question.options ?? [], random),
        };
      }
      if (question.type === "ordering") {
        return {
          ...question,
          options: shuffleArray(question.options ?? [], random),
        };
      }
      return question;
    }),
  };
}

export function isAnswerComplete(
  question: FormQuestion,
  value: unknown
): boolean {
  if (!question.required) {
    return true;
  }

  switch (question.type) {
    case "text":
    case "textarea":
    case "date":
    case "single_choice":
      return typeof value === "string" && value.trim().length > 0;
    case "number":
      return typeof value === "number" && !Number.isNaN(value);
    case "multi_choice":
      return Array.isArray(value) && value.length > 0;
    case "classification": {
      if (!value || typeof value !== "object") return false;
      const map = value as Record<string, string>;
      return (question.classificationItems ?? []).every(
        (item) => typeof map[item.id] === "string" && map[item.id].length > 0
      );
    }
    case "ordering":
      return Boolean(value && typeof value === "object" && "order" in value && "excluded" in value);
    case "decision_two_level": {
      if (!value || typeof value !== "object") return false;
      const v = value as { action?: string; reason?: string };
      return Boolean(v.action && v.reason);
    }
    default: {
      const _exhaustive: never = question.type;
      return _exhaustive;
    }
  }
}

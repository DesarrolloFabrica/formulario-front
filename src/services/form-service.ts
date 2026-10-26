import { getRoleConfig, type RoleId } from "@/config/roles";
import { authService } from "@/services/auth-service";
import { apiRequest, getApiErrorMessage } from "@/services/api-client";
import type { FormAnswerValue, FormConfig, FormQuestion, FormSubmissionPayload, FormSubmissionResult, FormSubmissionService } from "@/types/forms";

interface ApiOption { label: string; text: string }
interface ApiQuestion {
  id: string; externalId: string; position: number; block: string;
  type: { code: string }; competency: { name: string }; toolContext: string | null;
  prompt: string; context: string | null;
  response: Record<string, unknown> | null;
  groups: { code: string; label: string | null; options: ApiOption[] }[];
  categories: ApiOption[];
}
interface ApiAttempt {
  id: string; track: { name: string }; campaign: { name: string };
  questions: ApiQuestion[];
}

function token(): string {
  const value = authService.getSession()?.accessToken;
  if (!value) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  return value;
}

function options(values: ApiOption[] = []) { return values.map((item) => ({ id: item.label, label: item.text })); }

function toQuestion(question: ApiQuestion): FormQuestion {
  const all = question.groups.flatMap((group) => group.options);
  const code = question.type.code.toUpperCase();
  const base = {
    id: question.externalId, backendId: question.id, number: question.position,
    block: question.block, sectionId: question.block, label: question.prompt,
    helpText: question.context, required: true, competencia: question.competency.name,
    herramienta: question.toolContext,
  };
  if (code === "CLAS") {
    const left = question.groups.find((group) => group.code === "LEFT") ?? question.groups[0];
    const right = question.groups.find((group) => group.code === "RIGHT") ?? question.groups[1];
    return {
      ...base,
      type: "classification",
      classificationItems: options(left?.options),
      classificationCategories: options(
        question.categories.length ? question.categories : right?.options,
      ),
    };
  }
  if (code === "DEC-2") return { ...base, type: "decision_two_level", actions: options(question.groups[0]?.options), reasons: options(question.groups[1]?.options) };
  if (code === "ORD") return { ...base, type: "ordering", options: options(all) };
  return { ...base, type: code === "SMM" ? "multi_choice" : "single_choice", options: options(all) };
}

function fromApiAnswer(question: ApiQuestion): FormAnswerValue {
  const response = question.response;
  if (!response) return undefined;
  if (question.type.code === "CLAS") return response.pairs as Record<string, string>;
  if (question.type.code === "DEC-2") return { action: String(response.action ?? ""), reason: String(response.reason ?? "") };
  if (question.type.code === "ORD") return { order: response.order as string[] ?? [], excluded: response.excluded as string[] ?? [] };
  return response.selected as string | string[];
}

function toApiAnswer(question: FormQuestion, value: FormAnswerValue): Record<string, unknown> {
  switch (question.type) {
    case "single_choice": case "multi_choice": return { selected: value };
    case "classification": return { pairs: value };
    case "decision_two_level": return value as Record<string, unknown>;
    case "ordering": return value as Record<string, unknown>;
    default: return { selected: value };
  }
}

export class ApiFormSubmissionService implements FormSubmissionService {
  private attempts = new Map<RoleId, FormConfig>();

  async getFormConfig(roleId: RoleId): Promise<FormConfig> {
    const attempt = await apiRequest<ApiAttempt>("/attempts", { method: "POST" }, token());
    const role = getRoleConfig(roleId);
    const questions = attempt.questions.map(toQuestion);
    const sections = [...new Set(questions.map((q) => q.sectionId))].map((id) => ({
      id, title: id === "transversal" ? "Núcleo transversal" : `Banco del rol — ${role.name}`,
    }));
    const config: FormConfig = {
      attemptId: attempt.id, roleId, name: attempt.track.name,
      title: attempt.campaign.name, description: "Tus respuestas se guardarán y calificarán al enviar.",
      sections, questions,
      initialAnswers: Object.fromEntries(attempt.questions.flatMap((question) => {
        const value = fromApiAnswer(question);
        return value === undefined ? [] : [[question.externalId, value]];
      })),
    };
    this.attempts.set(roleId, config);
    return config;
  }

  async submit(payload: FormSubmissionPayload): Promise<FormSubmissionResult> {
    try {
      const config = this.attempts.get(payload.roleId);
      if (!config?.attemptId) throw new Error("No se encontró el intento activo. Recarga la página.");
      for (const question of config.questions) {
        await apiRequest(`/attempts/${config.attemptId}/items/${question.backendId}`, {
          method: "PUT", body: JSON.stringify(toApiAnswer(question, payload.answers[question.id])),
        }, token());
      }
      await apiRequest(`/attempts/${config.attemptId}/submit`, { method: "POST" }, token());
      return { success: true, submissionId: config.attemptId, message: "Evaluación enviada y calificada correctamente." };
    } catch (error) {
      return { success: false, message: getApiErrorMessage(error) };
    }
  }
}

export const formService: FormSubmissionService = new ApiFormSubmissionService();

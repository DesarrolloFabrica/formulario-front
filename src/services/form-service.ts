import { getFormByRole } from "@/data/mock-forms";
import { sleep } from "@/lib/utils";
import type { RoleId } from "@/config/roles";
import type {
  FormConfig,
  FormSubmissionPayload,
  FormSubmissionResult,
  FormSubmissionService,
} from "@/types/forms";

/**
 * Servicio MOCK de envío de formularios.
 * Sustituir por un cliente HTTP real implementando FormSubmissionService.
 */
export class MockFormSubmissionService implements FormSubmissionService {
  getFormConfig(roleId: RoleId): FormConfig {
    return getFormByRole(roleId);
  }

  async submit(payload: FormSubmissionPayload): Promise<FormSubmissionResult> {
    await sleep(1100);

    if (!payload.userId || !payload.roleId) {
      return {
        success: false,
        message: "No se pudo identificar al usuario o al formulario.",
      };
    }

    const answerCount = Object.keys(payload.answers).length;
    if (answerCount === 0) {
      return {
        success: false,
        message: "No hay respuestas para enviar.",
      };
    }

    // Simulación ocasional de error controlado (~5 %)
    if (Math.random() < 0.05) {
      return {
        success: false,
        message:
          "No fue posible completar el envío simulado. Inténtalo de nuevo.",
      };
    }

    const submissionId = `mock-${payload.roleId}-${Date.now()}`;

    return {
      success: true,
      submissionId,
      message:
        "Envío simulado correctamente. Los datos no se almacenaron en un servidor.",
    };
  }
}

export const formService: FormSubmissionService = new MockFormSubmissionService();

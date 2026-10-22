import type { RoleId } from "@/config/roles";
import type { FormConfig } from "@/types/forms";
import formsBank from "@/data/forms-bank.json";

const FORMS = formsBank as Record<RoleId, FormConfig>;

export function getFormByRole(roleId: RoleId): FormConfig {
  const form = FORMS[roleId];
  if (!form) {
    throw new Error(`No existe configuración de formulario para el rol: ${roleId}`);
  }
  return form;
}

export function getAllForms(): FormConfig[] {
  return Object.values(FORMS);
}

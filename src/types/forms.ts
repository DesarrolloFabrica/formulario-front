import type { RoleId } from "@/config/roles";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "single_choice"
  | "multi_choice"
  | "classification"
  | "ordering"
  | "decision_two_level";

export interface AnswerOption {
  id: string;
  label: string;
}

export interface FormSectionConfig {
  id: string;
  title: string;
  description?: string;
}

export interface FormQuestion {
  id: string;
  backendId?: string;
  number: number;
  block: string;
  sectionId: string;
  label: string;
  helpText?: string | null;
  required: boolean;
  type: FieldType;
  competencia?: string | null;
  herramienta?: string | null;
  options?: AnswerOption[];
  classificationItems?: AnswerOption[];
  classificationCategories?: AnswerOption[];
  actions?: AnswerOption[];
  reasons?: AnswerOption[];
}

export interface FormConfig {
  attemptId?: string;
  initialAnswers?: FormAnswers;
  roleId: RoleId;
  name: string;
  title: string;
  description: string;
  sections: FormSectionConfig[];
  questions: FormQuestion[];
}

export type DecisionTwoLevelAnswer = {
  action: string;
  reason: string;
};

export type ClassificationAnswer = Record<string, string>;
export type OrderingAnswer = { order: string[]; excluded: string[] };

export type FormAnswerValue =
  | string
  | number
  | string[]
  | ClassificationAnswer
  | DecisionTwoLevelAnswer
  | OrderingAnswer
  | null
  | undefined;

export type FormAnswers = Record<string, FormAnswerValue>;

export interface FormSubmissionPayload {
  roleId: RoleId;
  userId: string;
  answers: FormAnswers;
  submittedAt: string;
}

export interface FormSubmissionSuccess {
  success: true;
  submissionId: string;
  message: string;
}

export interface FormSubmissionError {
  success: false;
  message: string;
}

export type FormSubmissionResult = FormSubmissionSuccess | FormSubmissionError;

export interface FormSubmissionService {
  submit(payload: FormSubmissionPayload): Promise<FormSubmissionResult>;
  getFormConfig(roleId: RoleId): Promise<FormConfig>;
}

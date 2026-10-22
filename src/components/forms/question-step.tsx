import type { FormQuestion } from "@/types/forms";
import { FormField } from "@/components/forms/form-field";
import { QuestionHeader } from "@/components/forms/question-header";

interface QuestionStepProps {
  question: FormQuestion;
  current: number;
  total: number;
  sectionTitle?: string;
}

export function QuestionStep({
  question,
  current,
  total,
  sectionTitle,
}: QuestionStepProps) {
  return (
    <section className="space-y-8" aria-labelledby={`${question.id}-title`}>
      <QuestionHeader
        question={question}
        current={current}
        total={total}
        sectionTitle={sectionTitle}
      />
      <FormField question={question} />
    </section>
  );
}

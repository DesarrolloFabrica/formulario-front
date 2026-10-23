import type { FormQuestion } from "@/types/forms";

interface QuestionHeaderProps {
  question: FormQuestion;
  current: number;
  total: number;
  sectionTitle?: string;
}

export function QuestionHeader({
  question,
  current,
  total,
  sectionTitle,
}: QuestionHeaderProps) {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-[0.16em] text-lavender">
        <span>
          Pregunta {current} de {total}
        </span>
        {sectionTitle ? (
          <>
            <span className="h-1 w-1 rounded-full bg-border-strong" aria-hidden />
            <span className="text-muted">{sectionTitle}</span>
          </>
        ) : null}
      </div>

      <div className="space-y-3">
        <h2
          id={`${question.id}-title`}
          tabIndex={-1}
          className="font-display text-3xl leading-tight text-foreground outline-none sm:text-4xl lg:text-[2.65rem]"
        >
          {question.label}
          {question.required ? (
            <span className="ml-1 text-lavender" aria-hidden>
              *
            </span>
          ) : null}
        </h2>
        {question.herramienta ? (
          <p className="text-sm font-medium text-lavender">
            Herramienta: {question.herramienta}
          </p>
        ) : null}
        {question.helpText ? (
          <p
            id={`${question.id}-help`}
            className="max-w-3xl whitespace-pre-wrap text-base leading-relaxed text-muted"
          >
            {question.helpText}
          </p>
        ) : null}
      </div>
    </header>
  );
}

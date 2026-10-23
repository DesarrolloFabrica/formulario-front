interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-6">
      <div className="space-y-1 border-b border-border pb-3">
        <h2 className="font-display text-lg text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted">{description}</p>
        ) : null}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

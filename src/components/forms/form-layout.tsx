interface FormLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
}

export function FormLayout({ header, children }: FormLayoutProps) {
  return (
    <div className="min-h-screen bg-app text-foreground">
      {header}
      <main className="mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:w-[94%] lg:max-w-[1700px] lg:px-0 lg:py-10">
        {children}
      </main>
    </div>
  );
}

interface FormLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
}

export function FormLayout({ header, children }: FormLayoutProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4f7f8_0%,#eef2f4_45%,#f8fafb_100%)]">
      {header}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}

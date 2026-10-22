interface LoginPanelProps {
  children: React.ReactNode;
}

export function LoginPanel({ children }: LoginPanelProps) {
  return (
    <section className="flex min-h-[calc(100dvh-360px)] min-w-0 w-full items-center px-5 py-12 sm:min-h-[calc(100dvh-430px)] sm:px-10 sm:py-16 lg:min-h-dvh lg:px-[clamp(2.5rem,7vw,7rem)] lg:py-14">
      <div className="mx-auto min-w-0 w-full max-w-[450px]">
        <header className="mb-9 space-y-2.5 sm:mb-10">
          <h1 className="font-display text-4xl leading-tight text-[var(--login-text)] sm:text-5xl">
            Iniciar sesión
          </h1>
          <p className="text-base text-[var(--login-text-muted)]">
            Accede a tu espacio de formularios.
          </p>
        </header>

        {children}
      </div>
    </section>
  );
}

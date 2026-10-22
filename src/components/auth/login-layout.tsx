interface LoginLayoutProps {
  illustration: React.ReactNode;
  children: React.ReactNode;
}

export function LoginLayout({ illustration, children }: LoginLayoutProps) {
  return (
    <main className="login-theme grid min-h-dvh w-full grid-cols-[minmax(0,1fr)] overflow-x-hidden bg-[linear-gradient(135deg,var(--login-bg)_0%,var(--login-gradient-mid)_35%,var(--login-gradient-end)_70%,var(--login-primary)_100%)] font-sans lg:grid-cols-2">
      {illustration}
      <div className="flex min-w-0 bg-[linear-gradient(145deg,var(--login-panel)_0%,var(--login-bg)_58%,#130532_100%)]">
        {children}
      </div>
    </main>
  );
}

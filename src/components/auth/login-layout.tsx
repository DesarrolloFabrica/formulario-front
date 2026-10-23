interface LoginLayoutProps {
  illustration: React.ReactNode;
  children: React.ReactNode;
}

export function LoginLayout({ illustration, children }: LoginLayoutProps) {
  return (
    <main className="login-theme grid min-h-dvh w-full grid-cols-[minmax(0,1fr)] overflow-x-hidden bg-login font-sans lg:grid-cols-2">
      {illustration}
      <div className="flex min-w-0 bg-panel-gradient">
        {children}
      </div>
    </main>
  );
}

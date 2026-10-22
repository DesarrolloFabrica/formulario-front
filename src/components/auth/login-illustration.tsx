import { PencilRive } from "@/components/auth/pencil-rive";

export function LoginIllustration() {
  return (
    <section
      className="relative flex min-h-[360px] min-w-0 overflow-hidden bg-[radial-gradient(circle_at_50%_45%,rgba(144,91,244,0.30),transparent_58%),linear-gradient(145deg,#0f032d_0%,#291160_55%,#4e2bcc_100%)] lg:min-h-dvh lg:items-center lg:justify-center"
      aria-label="Ilustración de la Fábrica de Contenidos"
    >
      <div
        className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#905bf4]/12 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-36 -right-20 h-96 w-96 rounded-full bg-[#4e2bcc]/20 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute left-[10%] top-[12%] h-16 w-16 rotate-12 rounded-[1.4rem] border border-[#b99aff]/15 bg-[#905bf4]/5"
        aria-hidden
      />
      <div
        className="absolute bottom-[15%] right-[10%] h-24 w-24 -rotate-12 rounded-full border border-[#b99aff]/15 bg-[#4e2bcc]/10"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[360px] min-w-0 w-full flex-col items-center justify-center px-6 py-7 text-center sm:min-h-[430px] sm:px-10 sm:py-10 lg:h-dvh lg:min-h-0 lg:px-10 lg:py-12">
        <div className="relative flex h-[230px] min-h-0 w-full items-center justify-center sm:h-[290px] lg:h-auto lg:flex-1">
          <div
            className="absolute bottom-[8%] h-[13%] w-[62%] rounded-[50%] bg-[#0f032d]/45 blur-xl lg:bottom-[12%]"
            aria-hidden
          />
          <PencilRive className="relative h-full w-full max-w-[82%] drop-shadow-[0_28px_30px_rgba(15,3,45,0.42)] lg:h-[min(62dvh,720px)] lg:max-w-[88%]" />
        </div>

        <div className="relative z-10 max-w-md space-y-2 pt-2 lg:pb-2 lg:pt-0">
          <p className="font-display text-2xl leading-tight text-[var(--login-text)] sm:text-3xl xl:text-4xl">
            Tus ideas toman forma aquí
          </p>
          <p className="text-sm leading-relaxed text-[var(--login-text-muted)] xl:text-base">
            Un espacio pensado para crear, compartir y avanzar juntos.
          </p>
        </div>
      </div>
    </section>
  );
}

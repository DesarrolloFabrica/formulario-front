import Image from "next/image";

interface FormAvatarProps {
  questionNumber: number;
}

export function FormAvatar({ questionNumber }: FormAvatarProps) {
  return (
    <aside
      className="relative hidden min-h-[26rem] overflow-hidden rounded-[2rem] border border-[#d7e8c4] bg-[radial-gradient(circle_at_50%_28%,#e8facf_0%,#d7f2a7_40%,#f7f9f4_78%)] md:flex md:items-center md:justify-center lg:min-h-[30rem]"
      aria-label="Avatar del formulario"
    >
      <div className="flex flex-col items-center gap-6 px-4 text-center lg:px-8">
        <div className="relative flex h-40 w-40 items-center justify-center lg:h-52 lg:w-52">
          <div
            className="absolute bottom-2 h-6 w-28 rounded-full bg-[#315b43]/20 blur-md"
            aria-hidden
          />
          <Image
            src="/images/lapiz-kawaii.png"
            alt="Lápiz sonriente de la Fábrica de Contenidos"
            width={416}
            height={416}
            className="relative h-full w-full object-contain drop-shadow-[0_18px_24px_rgba(49,91,67,0.22)]"
            priority={false}
          />
        </div>
        <div className="space-y-1.5">
          <p className="font-display text-xl text-slate-900">¡Vas muy bien!</p>
          <p className="text-sm text-slate-500">Pregunta {questionNumber}</p>
        </div>
      </div>
    </aside>
  );
}

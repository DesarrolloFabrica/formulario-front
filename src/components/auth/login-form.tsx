"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getFormPathForRole } from "@/config/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_USERS } from "@/data/mock-users";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Ingresa un correo válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await login(values);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    router.replace(getFormPathForRole(result.roleId));
  });

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-2.5">
          <Label htmlFor="email" className="ml-1 text-sm font-medium text-[var(--login-text)]">
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="correo@ejemplo.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="h-[52px] rounded-[14px] border-[var(--login-border)] bg-[var(--login-surface)] px-4 text-base text-[var(--login-text)] shadow-none transition-colors duration-200 placeholder:text-[var(--login-placeholder)] hover:border-[var(--login-border-hover)] focus-visible:border-[var(--login-primary)] focus-visible:ring-[3px] focus-visible:ring-[#905bf4]/30 focus-visible:ring-offset-0 aria-invalid:border-[#fda4af] aria-invalid:focus-visible:ring-[#fb7185]/20 disabled:bg-[#291b48] disabled:text-[var(--login-text-muted)]"
            {...register("email")}
          />
          {errors.email ? (
            <p id="email-error" className="ml-1 text-sm text-[#fda4af]" role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="password" className="ml-1 text-sm font-medium text-[var(--login-text)]">
            Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            className="h-[52px] rounded-[14px] border-[var(--login-border)] bg-[var(--login-surface)] px-4 text-base text-[var(--login-text)] shadow-none transition-colors duration-200 placeholder:text-[var(--login-placeholder)] hover:border-[var(--login-border-hover)] focus-visible:border-[var(--login-primary)] focus-visible:ring-[3px] focus-visible:ring-[#905bf4]/30 focus-visible:ring-offset-0 aria-invalid:border-[#fda4af] aria-invalid:focus-visible:ring-[#fb7185]/20 disabled:bg-[#291b48] disabled:text-[var(--login-text-muted)]"
            {...register("password")}
          />
          {errors.password ? (
            <p
              id="password-error"
              className="ml-1 text-sm text-[#fda4af]"
              role="alert"
            >
              {errors.password.message}
            </p>
          ) : null}
        </div>

        {serverError ? (
          <p
            className="rounded-xl border border-[#9f4454] bg-[#3c1724]/70 px-4 py-3 text-sm text-[#fecdd3]"
            role="alert"
          >
            {serverError}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="h-[52px] w-full rounded-[14px] bg-[var(--login-primary)] text-base font-semibold text-[var(--login-bg)] shadow-none transition-colors duration-200 hover:bg-[var(--login-primary-hover)] focus-visible:ring-[3px] focus-visible:ring-[#b99aff]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--login-bg)] disabled:bg-[#4e3474] disabled:text-[var(--login-text-muted)] motion-reduce:transition-none"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              Iniciando sesión…
            </>
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </form>

      <details className="mt-7 rounded-[14px] border border-[var(--login-border)] bg-[var(--login-surface)] px-4 py-3 text-left text-xs text-[var(--login-text-muted)] transition-colors duration-200 hover:bg-[var(--login-surface-hover)] open:border-[var(--login-border-hover)] motion-reduce:transition-none">
        <summary className="cursor-pointer select-none rounded-md font-medium text-[var(--login-text)] outline-none marker:text-[var(--login-primary)] hover:text-[#b99aff] focus-visible:ring-2 focus-visible:ring-[var(--login-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--login-bg)]">
          Usuarios de demostración
        </summary>
        <ul className="mt-3 space-y-2 border-t border-[var(--login-border)] pt-3">
          {MOCK_USERS.map((user) => (
            <li key={user.id} className="break-words">
              <span className="font-semibold">{user.roleId}:</span> {user.email} /{" "}
              {user.password}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

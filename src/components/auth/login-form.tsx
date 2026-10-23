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
            className="h-[52px] rounded-[14px] px-4 text-base shadow-none transition-colors duration-200 focus-visible:ring-[3px] focus-visible:ring-offset-0 disabled:bg-surface disabled:text-muted"
            {...register("email")}
          />
          {errors.email ? (
            <p id="email-error" className="ml-1 text-sm text-danger" role="alert">
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
            className="h-[52px] rounded-[14px] px-4 text-base shadow-none transition-colors duration-200 focus-visible:ring-[3px] focus-visible:ring-offset-0 disabled:bg-surface disabled:text-muted"
            {...register("password")}
          />
          {errors.password ? (
            <p
              id="password-error"
              className="ml-1 text-sm text-danger"
              role="alert"
            >
              {errors.password.message}
            </p>
          ) : null}
        </div>

        {serverError ? (
          <p
            className="rounded-xl border border-danger-border bg-danger-surface/70 px-4 py-3 text-sm text-danger-foreground"
            role="alert"
          >
            {serverError}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="h-[52px] w-full rounded-[14px] text-base font-semibold shadow-none transition-colors duration-200 focus-visible:ring-[3px] disabled:bg-accent-soft disabled:text-muted motion-reduce:transition-none"
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
        <summary className="cursor-pointer select-none rounded-md font-medium text-[var(--login-text)] outline-none marker:text-[var(--login-primary)] hover:text-accent-hover focus-visible:ring-2 focus-visible:ring-[var(--login-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--login-bg)]">
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

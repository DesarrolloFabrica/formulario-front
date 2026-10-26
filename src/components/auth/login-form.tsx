"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/hooks/use-auth";

declare global {
  interface Window {
    __formulariosGoogleInitialized?: boolean;
    google?: { accounts: { id: {
      initialize(options: { client_id: string; callback: (response: { credential: string }) => void }): void;
      renderButton(element: HTMLElement, options: Record<string, string | number>): void;
    } } };
  }
}

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const hasGoogleClientId = Boolean(clientId && clientId !== "tu-client-id.apps.googleusercontent.com");
const subscribeHostname = () => () => undefined;
const getIsLocalhost = () => ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLocalhost = useSyncExternalStore(subscribeHostname, getIsLocalhost, () => false);
  const [email, setEmail] = useState("");

  const finishLogin = useCallback(async (credentials: { idToken?: string; email?: string }) => {
    setIsSubmitting(true);
    setServerError(null);
    const result = await login(credentials);
    setIsSubmitting(false);
    if (!result.ok) return setServerError(result.message);
    router.replace(result.path);
  }, [login, router]);

  useEffect(() => {
    if (!ready || !hasGoogleClientId || !clientId || !window.google || !buttonRef.current) return;
    if (!window.__formulariosGoogleInitialized) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          await finishLogin({ idToken: credential });
        },
      });
      window.__formulariosGoogleInitialized = true;
    }
    buttonRef.current.replaceChildren();
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard", theme: "outline", size: "large", shape: "pill",
      text: "signin_with", width: 360, locale: "es",
    });
  }, [finishLogin, ready]);

  return (
    <div className="space-y-5">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => setReady(true)} />
      {!hasGoogleClientId ? (
        <>
          <button type="button" disabled className="h-11 w-full rounded-full border border-border bg-surface px-4 font-medium text-muted opacity-70">
            Continuar con Google
          </button>
          <p className="rounded-xl border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger-foreground" role="alert">
            Configura un NEXT_PUBLIC_GOOGLE_CLIENT_ID real para habilitar este acceso.
          </p>
        </>
      ) : null}
      {hasGoogleClientId ? <div className="flex min-h-11 justify-center" ref={buttonRef} aria-busy={isSubmitting} /> : null}
      {isLocalhost ? (
        <form
          className="space-y-3 border-t border-border pt-5"
          onSubmit={(event) => {
            event.preventDefault();
            void finishLogin({ email: email.trim() });
          }}
        >
          <label htmlFor="local-email" className="block text-sm font-medium text-foreground">
            Acceso local
          </label>
          <input
            id="local-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="usuario@cun.edu.co"
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-foreground outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="h-12 w-full rounded-xl bg-accent px-4 font-semibold text-accent-foreground disabled:opacity-50"
          >
            Entrar solo con correo
          </button>
        </form>
      ) : null}
      {isSubmitting ? <p className="text-center text-sm text-muted">Validando tu cuenta institucional…</p> : null}
      {serverError ? <p className="rounded-xl border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger-foreground" role="alert">{serverError}</p> : null}
      <p className="text-center text-xs leading-relaxed text-muted">Ingresa con tu cuenta institucional @cun.edu.co.</p>
    </div>
  );
}

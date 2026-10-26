"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, LoaderCircle } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FormHeader } from "@/components/forms/form-header";
import { FormLayout } from "@/components/forms/form-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, getApiErrorMessage } from "@/services/api-client";

const ADMIN_EMAIL = "desarrollofabrica@cun.edu.co";

interface Campaign {
  code: string;
  name: string;
  status: "draft" | "open" | "closed";
  closes_at: string | null;
}

export default function AdminPage() {
  return <AuthGuard><CampaignAdmin /></AuthGuard>;
}

function CampaignAdmin() {
  const { user, accessToken, logout } = useAuth();
  const router = useRouter();
  const [closesAt, setClosesAt] = useState("");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadCampaign = useCallback(async () => {
    if (!accessToken) return;
    try {
      const campaigns = await apiRequest<Campaign[]>("/admin/campaigns", {}, accessToken);
      setCampaign(campaigns.find((item) => item.status === "open") ?? null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadCampaign(), 0);
    return () => window.clearTimeout(timer);
  }, [loadCampaign]);

  if (!user) return null;

  const authorized = user.appRole === "admin" && user.email.toLowerCase() === ADMIN_EMAIL;
  const handleLogout = async () => { await logout(); router.replace("/login"); };

  const launch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken || !closesAt) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const closingDate = new Date(closesAt);
      await apiRequest<Campaign>("/admin/campaigns/launch", {
        method: "POST",
        body: JSON.stringify({
          name: `Evaluación de competencias en IA · ${closingDate.toLocaleDateString("es-CO")}`,
          closesAt: closingDate.toISOString(),
          maxAttempts: 1,
          shuffleOptions: true,
        }),
      }, accessToken);
      setMessage("La prueba quedó habilitada correctamente.");
      await loadCampaign();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayout header={<FormHeader projectName="Fábrica de Contenidos" formName="Administración de evaluaciones" userName={user.name} onLogout={handleLogout} />}>
      {!authorized ? (
        <p className="rounded-xl border border-danger-border bg-danger-surface p-4 text-danger-foreground">No tienes permiso para administrar las pruebas.</p>
      ) : (
        <section className="mx-auto max-w-2xl rounded-3xl border border-border bg-panel p-6 shadow-card sm:p-8">
          <div className="mb-7 flex items-start gap-4">
            <span className="rounded-2xl bg-accent-soft p-3 text-lavender"><CalendarClock className="h-7 w-7" /></span>
            <div><h2 className="font-display text-2xl text-foreground">Habilitar prueba</h2><p className="mt-1 text-sm text-muted">Define hasta qué fecha y hora estará disponible para los participantes.</p></div>
          </div>

          {loading ? <p className="text-sm text-muted">Consultando estado…</p> : campaign ? (
            <div className="rounded-2xl border border-accent/50 bg-accent-soft p-5">
              <p className="flex items-center gap-2 font-semibold text-foreground"><CheckCircle2 className="h-5 w-5 text-lavender" />La prueba está habilitada</p>
              <p className="mt-2 text-sm text-muted">Cierra el {campaign.closes_at ? new Date(campaign.closes_at).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" }) : "sin fecha definida"}.</p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={launch}>
              <div className="space-y-2">
                <label htmlFor="closes-at" className="text-sm font-semibold text-foreground">Fecha y hora de finalización</label>
                <input id="closes-at" type="datetime-local" required value={closesAt} onChange={(event) => setClosesAt(event.target.value)} className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-foreground outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={submitting || !closesAt}>
                {submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" />Habilitando…</> : "Habilitar prueba"}
              </Button>
            </form>
          )}
          {message ? <p className="mt-5 rounded-xl border border-accent/50 bg-accent-soft p-4 text-sm text-foreground">{message}</p> : null}
          {error ? <p className="mt-5 rounded-xl border border-danger-border bg-danger-surface p-4 text-sm text-danger-foreground" role="alert">{error}</p> : null}
        </section>
      )}
    </FormLayout>
  );
}

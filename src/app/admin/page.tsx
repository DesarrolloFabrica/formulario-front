"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  LoaderCircle,
  Search,
  UserRound,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FormHeader } from "@/components/forms/form-header";
import { FormLayout } from "@/components/forms/form-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, getApiErrorMessage } from "@/services/api-client";

const ADMIN_EMAIL = "desarrollofabrica@cun.edu.co";

interface Campaign {
  code: string;
  status: "draft" | "open" | "closed" | "cancelled";
  closes_at: string | null;
  target_participant_id: string | null;
  intentos: number;
  en_curso: number;
  enviados: number;
  convocados: number;
}

interface Participant {
  id: string;
  full_name: string;
  edu_email: string | null;
  track_name: string | null;
  role_name: string | null;
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <CampaignAdmin />
    </AuthGuard>
  );
}

function CampaignAdmin() {
  const { user, accessToken, logout } = useAuth();
  const router = useRouter();
  const [scope, setScope] = useState<"all" | "individual">("individual");
  const [closesAt, setClosesAt] = useState("");
  const [search, setSearch] = useState("");
  const [openSearch, setOpenSearch] = useState("");
  const [targetParticipantId, setTargetParticipantId] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    try {
      const [allCampaigns, people] = await Promise.all([
        apiRequest<Campaign[]>("/admin/campaigns", {}, accessToken),
        apiRequest<Participant[]>(
          "/admin/participants?onlyActive=true",
          {},
          accessToken,
        ),
      ]);
      setCampaigns(allCampaigns.filter((item) => item.status === "open"));
      setParticipants(people.filter((person) => person.track_name));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    const refresh = window.setInterval(() => void loadData(), 15_000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(refresh);
    };
  }, [loadData]);

  const openTargetIds = useMemo(
    () =>
      new Set(
        campaigns.flatMap((campaign) =>
          campaign.target_participant_id
            ? [campaign.target_participant_id]
            : [],
        ),
      ),
    [campaigns],
  );
  const filteredParticipants = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es");
    return participants
      .filter((person) => !openTargetIds.has(person.id))
      .filter(
        (person) =>
          !term ||
          `${person.full_name} ${person.edu_email ?? ""} ${person.track_name ?? ""}`
            .toLocaleLowerCase("es")
            .includes(term),
      )
      .slice(0, 8);
  }, [openTargetIds, participants, search]);
  const filteredCampaigns = useMemo(() => {
    const term = openSearch.trim().toLocaleLowerCase("es");
    if (!term) return campaigns;
    return campaigns.filter((campaign) => {
      const person = participants.find(
        (item) => item.id === campaign.target_participant_id,
      );
      return `${campaign.code} ${person?.full_name ?? "evaluación general"} ${person?.edu_email ?? ""} ${person?.role_name ?? ""} ${person?.track_name ?? ""}`
        .toLocaleLowerCase("es")
        .includes(term);
    });
  }, [campaigns, openSearch, participants]);

  if (!user) return null;
  const authorized =
    user.appRole === "admin" && user.email.toLowerCase() === ADMIN_EMAIL;
  const hasGeneralCampaign = campaigns.some(
    (campaign) => !campaign.target_participant_id,
  );
  const scopeBlocked =
    hasGeneralCampaign || (scope === "all" && campaigns.length > 0);
  const selectedParticipant = participants.find(
    (person) => person.id === targetParticipantId,
  );
  const participantName = (id: string | null) =>
    participants.find((person) => person.id === id)?.full_name ??
    "Participante";

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const launch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken || !closesAt) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const closingDate = new Date(closesAt);
      await apiRequest<Campaign>(
        "/admin/campaigns/launch",
        {
          method: "POST",
          body: JSON.stringify({
            name: `Evaluación de competencias en IA · ${closingDate.toLocaleDateString("es-CO")}`,
            closesAt: closingDate.toISOString(),
            maxAttempts: 1,
            shuffleOptions: true,
            ...(scope === "individual" ? { targetParticipantId } : {}),
          }),
        },
        accessToken,
      );
      setMessage(
        scope === "individual"
          ? `Prueba habilitada para ${selectedParticipant?.full_name}.`
          : "Evaluación general habilitada.",
      );
      setTargetParticipantId("");
      setSearch("");
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (campaign: Campaign) => {
    if (campaign.enviados > 0) return;
    if (
      !accessToken ||
      !window.confirm(
        `¿Cancelar la evaluación de ${campaign.target_participant_id ? participantName(campaign.target_participant_id) : "todos los participantes"}?`,
      )
    )
      return;
    setCancelling(campaign.code);
    setError(null);
    setMessage(null);
    try {
      await apiRequest(
        `/admin/campaigns/${encodeURIComponent(campaign.code)}/cancel`,
        { method: "POST" },
        accessToken,
      );
      setMessage("La evaluación fue cancelada y no generará resultado.");
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setCancelling(null);
    }
  };

  return (
    <FormLayout
      header={
        <FormHeader
          projectName="Fábrica de Contenidos"
          formName="Administración de evaluaciones"
          userName={user.name}
          onLogout={handleLogout}
        />
      }
    >
      {!authorized ? (
        <p className="rounded-xl border border-danger-border bg-danger-surface p-4 text-danger-foreground">
          No tienes permiso para administrar las pruebas.
        </p>
      ) : (
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,.8fr)]">
          <section className="rounded-3xl border border-border bg-panel p-6 shadow-card sm:p-8">
            <div className="mb-7 flex items-start gap-4">
              <span className="rounded-2xl bg-accent-soft p-3 text-lavender">
                <CalendarClock className="h-7 w-7" />
              </span>
              <div>
                <h2 className="font-display text-2xl text-foreground">
                  Habilitar evaluación
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Selecciona el alcance y define la fecha de cierre.
                </p>
              </div>
            </div>
            <form className="space-y-5" onSubmit={launch}>
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-foreground">
                  Alcance
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ScopeCard
                    active={scope === "all"}
                    title="Evaluación general"
                    description="Para todos los usuarios con prueba asignada."
                    onSelect={() => {
                      setScope("all");
                      setTargetParticipantId("");
                    }}
                  />
                  <ScopeCard
                    active={scope === "individual"}
                    title="Prueba individual"
                    description="Solo para la persona seleccionada."
                    onSelect={() => setScope("individual")}
                  />
                </div>
              </fieldset>

              {scope === "individual" ? (
                <div className="space-y-3">
                  <label
                    htmlFor="participant-search"
                    className="text-sm font-semibold text-foreground"
                  >
                    Buscar participante
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      id="participant-search"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setTargetParticipantId("");
                      }}
                      placeholder="Nombre, correo o prueba"
                      className="h-12 w-full rounded-xl border border-border bg-surface pl-11 pr-4 text-foreground outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  {selectedParticipant ? (
                    <button
                      type="button"
                      onClick={() => setTargetParticipantId("")}
                      className="flex w-full items-center gap-3 rounded-xl border border-accent bg-accent-soft p-3 text-left"
                    >
                      <UserRound className="h-5 w-5 text-lavender" />
                      <span>
                        <strong className="block text-sm text-foreground">
                          {selectedParticipant.full_name}
                        </strong>
                        <span className="text-xs text-muted">
                          {selectedParticipant.edu_email} ·{" "}
                          {selectedParticipant.track_name}
                        </span>
                      </span>
                    </button>
                  ) : search ? (
                    <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-border bg-surface p-2">
                      {filteredParticipants.length ? (
                        filteredParticipants.map((person) => (
                          <button
                            type="button"
                            key={person.id}
                            onClick={() => {
                              setTargetParticipantId(person.id);
                              setSearch(person.full_name);
                            }}
                            className="w-full rounded-lg p-3 text-left transition hover:bg-surface-hover"
                          >
                            <strong className="block text-sm text-foreground">
                              {person.full_name}
                            </strong>
                            <span className="text-xs text-muted">
                              {person.edu_email ?? "Sin correo"} ·{" "}
                              {person.track_name}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="p-3 text-sm text-muted">
                          No encontramos participantes disponibles.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted">
                      Escribe para buscar. Los usuarios con una prueba
                      individual abierta no aparecen.
                    </p>
                  )}
                </div>
              ) : null}

              <div className="space-y-2">
                <label
                  htmlFor="closes-at"
                  className="text-sm font-semibold text-foreground"
                >
                  Fecha y hora de finalización
                </label>
                <input
                  id="closes-at"
                  type="datetime-local"
                  required
                  value={closesAt}
                  onChange={(event) => setClosesAt(event.target.value)}
                  onClick={(event) => {
                    try {
                      event.currentTarget.showPicker();
                    } catch {}
                  }}
                  className="h-14 w-full cursor-pointer rounded-2xl border border-border bg-surface px-4 text-foreground outline-none focus:ring-2 focus:ring-accent [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
              {scopeBlocked ? (
                <p className="rounded-xl border border-warning-border bg-warning-surface p-3 text-sm text-warning">
                  Cancela las evaluaciones abiertas antes de habilitar una
                  evaluación general. Las pruebas individuales sí pueden
                  convivir entre ellas.
                </p>
              ) : null}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={
                  submitting ||
                  scopeBlocked ||
                  !closesAt ||
                  (scope === "individual" && !targetParticipantId)
                }
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Habilitando…
                  </>
                ) : (
                  "Habilitar prueba"
                )}
              </Button>
            </form>
            {message ? (
              <p className="mt-5 rounded-xl border border-accent/50 bg-accent-soft p-4 text-sm text-foreground">
                {message}
              </p>
            ) : null}
            {error ? (
              <p
                className="mt-5 rounded-xl border border-danger-border bg-danger-surface p-4 text-sm text-danger-foreground"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </section>

          <aside className="rounded-3xl border border-border bg-panel p-6 shadow-card">
            <h2 className="font-display text-xl text-foreground">
              Evaluaciones abiertas
            </h2>
            <p className="mt-1 text-sm text-muted">
              {campaigns.length} activa{campaigns.length === 1 ? "" : "s"}
            </p>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={openSearch}
                onChange={(event) => setOpenSearch(event.target.value)}
                placeholder="Buscar usuario o cargo"
                className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="mt-4 max-h-[36rem] space-y-3 overflow-y-auto pr-1">
              {loading ? (
                <p className="text-sm text-muted">Consultando…</p>
              ) : filteredCampaigns.length ? (
                filteredCampaigns.map((campaign) => {
                  const person = participants.find(
                    (item) => item.id === campaign.target_participant_id,
                  );
                  const notStarted = Math.max(
                    0,
                    campaign.convocados - campaign.intentos,
                  );
                  const progress = campaign.convocados
                    ? Math.round(
                        (campaign.enviados / campaign.convocados) * 100,
                      )
                    : 0;
                  return (
                    <div
                      key={campaign.code}
                      className="rounded-2xl border border-border bg-surface p-4"
                    >
                      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-lavender" />
                        {campaign.target_participant_id
                          ? participantName(campaign.target_participant_id)
                          : "Evaluación general"}
                      </p>
                      {person ? (
                        <>
                          <p className="mt-2 text-xs font-medium text-foreground">
                            {person.role_name ?? "Cargo no registrado"}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {person.edu_email ?? "Sin correo"} ·{" "}
                            {person.track_name}
                          </p>
                        </>
                      ) : null}
                      <p className="mt-2 text-xs text-muted">
                        Cierra:{" "}
                        {campaign.closes_at
                          ? new Date(campaign.closes_at).toLocaleString(
                              "es-CO",
                              { dateStyle: "medium", timeStyle: "short" },
                            )
                          : "Sin fecha"}
                      </p>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <ProgressStat label="Sin iniciar" value={notStarted} />
                        <ProgressStat
                          label="En curso"
                          value={campaign.en_curso}
                        />
                        <ProgressStat
                          label="Enviadas"
                          value={campaign.enviados}
                        />
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-accent-soft">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4 w-full border-danger-border text-danger-foreground"
                        disabled={
                          campaign.enviados > 0 || cancelling === campaign.code
                        }
                        onClick={() => void cancel(campaign)}
                      >
                        {cancelling === campaign.code ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : campaign.enviados > 0 ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Ban className="h-4 w-4" />
                        )}
                        {campaign.enviados > 0
                          ? "Evaluación enviada"
                          : "Cancelar evaluación"}
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
                  {campaigns.length
                    ? "No hay coincidencias."
                    : "No hay evaluaciones abiertas."}
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
    </FormLayout>
  );
}

function ScopeCard({
  active,
  title,
  description,
  onSelect,
}: {
  active: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <label
      className={`cursor-pointer rounded-2xl border p-4 transition ${active ? "border-accent bg-accent-soft ring-1 ring-accent/40" : "border-border bg-surface hover:border-border-strong"}`}
    >
      <input
        type="radio"
        name="scope"
        checked={active}
        onChange={onSelect}
        className="sr-only"
      />
      <span className="block font-semibold text-foreground">{title}</span>
      <span className="mt-1 block text-xs text-muted">{description}</span>
    </label>
  );
}

function ProgressStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-accent-soft/60 px-2 py-2">
      <strong className="block text-sm text-foreground">{value}</strong>
      <span className="text-[10px] text-muted">{label}</span>
    </div>
  );
}

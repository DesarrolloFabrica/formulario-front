"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FormLayout } from "@/components/forms/form-layout";
import { FormHeader } from "@/components/forms/form-header";
import { DynamicForm } from "@/components/forms/dynamic-form";
import { useAuth } from "@/hooks/use-auth";
import { getRoleConfig, type RoleId } from "@/config/roles";
import { formService } from "@/services/form-service";
import type { FormConfig } from "@/types/forms";
import { LoadingState } from "@/components/auth/loading-state";

interface RoleFormPageProps {
  roleId: RoleId;
}

export function RoleFormPage({ roleId }: RoleFormPageProps) {
  return (
    <AuthGuard requiredRoleId={roleId}>
      <RoleFormContent roleId={roleId} />
    </AuthGuard>
  );
}

function RoleFormContent({ roleId }: RoleFormPageProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const role = getRoleConfig(roleId);

  useEffect(() => {
    let active = true;
    formService.getFormConfig(roleId)
      .then((value) => { if (active) setConfig(value); })
      .catch((error: unknown) => { if (active) setLoadError(error instanceof Error ? error.message : "No fue posible cargar la evaluación."); });
    return () => { active = false; };
  }, [roleId]);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.replace("/login");
  };

  return (
    <FormLayout
      header={
        <FormHeader
          projectName="Fábrica de Contenidos"
          formName={role.name}
          userName={user.name}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
      }
    >
      {loadError ? (
        <p className="rounded-xl border border-danger-border bg-danger-surface p-4 text-danger-foreground" role="alert">
          {loadError}
        </p>
      ) : config ? (
        <DynamicForm config={config} user={user} />
      ) : (
        <LoadingState message="Preparando tu evaluación…" />
      )}
    </FormLayout>
  );
}

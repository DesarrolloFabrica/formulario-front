"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FormLayout } from "@/components/forms/form-layout";
import { FormHeader } from "@/components/forms/form-header";
import { DynamicForm } from "@/components/forms/dynamic-form";
import { useAuth } from "@/hooks/use-auth";
import { getRoleConfig, type RoleId } from "@/config/roles";
import { formService } from "@/services/form-service";

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
  const role = getRoleConfig(roleId);
  const config = formService.getFormConfig(roleId);

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
      <DynamicForm config={config} user={user} />
    </FormLayout>
  );
}

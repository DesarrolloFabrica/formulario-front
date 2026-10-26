"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getFormPathForRole, isRoleId } from "@/config/roles";
import { LoadingState } from "@/components/auth/loading-state";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Si se indica, exige que el usuario tenga este rol. */
  requiredRoleId?: string;
  /** Si true, redirige usuarios autenticados fuera de /login. */
  guestOnly?: boolean;
}

export function AuthGuard({
  children,
  requiredRoleId,
  guestOnly = false,
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (guestOnly) {
      if (isAuthenticated && user) {
        router.replace(user.appRole === "admin" ? "/admin" : user.roleId ? getFormPathForRole(user.roleId) : "/login");
      }
      return;
    }

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (requiredRoleId && isRoleId(requiredRoleId) && user.roleId !== requiredRoleId) {
      router.replace(user.appRole === "admin" ? "/admin" : user.roleId ? getFormPathForRole(user.roleId) : "/login");
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    guestOnly,
    requiredRoleId,
    router,
    pathname,
  ]);

  if (isLoading) {
    return <LoadingState message="Verificando sesión…" />;
  }

  if (guestOnly) {
    if (isAuthenticated) {
      return <LoadingState message="Redirigiendo a tu formulario…" />;
    }
    return <>{children}</>;
  }

  if (!isAuthenticated || !user) {
    return <LoadingState message="Redirigiendo al inicio de sesión…" />;
  }

  if (
    requiredRoleId &&
    isRoleId(requiredRoleId) &&
    user.roleId !== requiredRoleId
  ) {
    return <LoadingState message="Redirigiendo a tu formulario…" />;
  }

  return <>{children}</>;
}

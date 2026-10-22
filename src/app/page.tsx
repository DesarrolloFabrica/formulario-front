"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getFormPathForRole } from "@/config/roles";
import { LoadingState } from "@/components/auth/loading-state";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      router.replace(getFormPathForRole(user.roleId));
      return;
    }

    router.replace("/login");
  }, [isLoading, isAuthenticated, user, router]);

  return <LoadingState message="Preparando la aplicación…" />;
}

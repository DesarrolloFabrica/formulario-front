"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormHeaderProps {
  projectName: string;
  formName: string;
  userName: string;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export function FormHeader({
  projectName,
  formName,
  userName,
  onLogout,
  isLoggingOut = false,
}: FormHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="min-w-0 space-y-0.5">
          <p className="text-xs font-medium uppercase tracking-wide text-teal-800">
            {projectName}
          </p>
          <h1 className="truncate font-display text-lg text-slate-900 sm:text-xl">
            {formName}
          </h1>
          <p className="text-sm text-slate-500">{userName}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="shrink-0 self-start sm:self-auto"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
}

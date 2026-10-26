"use client";

import Image from "next/image";
import { LogOut, UserRound } from "lucide-react";

interface FormHeaderProps {
  projectName: string;
  formName: string;
  userName: string;
  userRole?: string;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export function FormHeader({
  projectName,
  formName,
  userName,
  userRole,
  onLogout,
  isLoggingOut = false,
}: FormHeaderProps) {
  return (
    <header className="formHeader">
      <div className="decorations" aria-hidden="true">
        <span className="arc" />
        <span className="wave" />
        <span className="dots" />
      </div>

      <div className="content">
        <div className="brand" aria-hidden="true">
          <div className="logoSurface">
            <Image
              src="/images/favicon.ico"
              alt=""
              width={256}
              height={256}
              unoptimized
              className="logo"
            />
          </div>
        </div>

        <div className="information">
          <p className="eyebrow">{projectName}</p>
          <h1 className="title">{formName}</h1>
          <div className="userBadge">
            <span className="userIcon">
              <UserRound aria-hidden="true" />
            </span>
            <span className="userText">{userName}</span>
            {userRole ? (
              <>
                <span className="userSeparator" aria-hidden="true" />
                <span className="userRole">{userRole}</span>
              </>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="logout"
        >
          <LogOut aria-hidden="true" />
          <span>{isLoggingOut ? "Cerrando…" : "Cerrar sesión"}</span>
        </button>
      </div>
    </header>
  );
}

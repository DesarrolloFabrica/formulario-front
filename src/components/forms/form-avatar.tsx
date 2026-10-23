"use client";

import Image from "next/image";
import { useState } from "react";
import { PencilRive } from "@/components/auth/pencil-rive";
import {
  DEFAULT_FORM_AVATAR,
  getRoleAvatar,
} from "@/config/role-avatars";
import type { RoleId } from "@/config/roles";

interface FormAvatarProps {
  questionNumber: number;
  roleId: RoleId;
}

export function FormAvatar({ questionNumber, roleId }: FormAvatarProps) {
  const avatar = getRoleAvatar(roleId);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const imageAvatar =
    avatar.type === "image" && avatar.src !== failedSource
      ? avatar
      : DEFAULT_FORM_AVATAR;

  return (
    <aside
      className="relative hidden min-h-[26rem] overflow-hidden rounded-[2rem] border border-border bg-avatar shadow-card md:flex md:items-center md:justify-center lg:min-h-[30rem]"
      aria-label="Avatar del formulario"
    >
      <div className="flex flex-col items-center gap-6 px-4 text-center lg:px-8">
        <div className="relative flex h-40 w-40 items-center justify-center lg:h-52 lg:w-52">
          <div
            className="absolute bottom-2 h-6 w-28 rounded-full bg-lavender/20 blur-md"
            aria-hidden
          />
          {avatar.type === "rive" ? (
            <PencilRive
              src={avatar.src}
              artboard={avatar.artboard}
              stateMachines={avatar.stateMachines}
              ariaLabel={avatar.alt}
              className="avatar-float relative h-full w-full drop-shadow-[0_18px_24px_rgb(15_3_45_/_0.55)]"
            />
          ) : (
            <Image
              src={imageAvatar.src}
              alt={imageAvatar.alt}
              width={imageAvatar.width}
              height={imageAvatar.height}
              sizes="(min-width: 1024px) 208px, 160px"
              className="avatar-float relative h-full w-full object-contain drop-shadow-[0_18px_24px_rgb(15_3_45_/_0.55)]"
              onError={() => setFailedSource(avatar.src)}
            />
          )}
        </div>
        <div className="space-y-1.5">
          <p className="font-display text-xl text-foreground">¡Vas muy bien!</p>
          <p className="text-sm text-muted">Pregunta {questionNumber}</p>
        </div>
      </div>
    </aside>
  );
}

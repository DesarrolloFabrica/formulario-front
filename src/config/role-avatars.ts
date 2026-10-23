import type { RoleId } from "@/config/roles";

interface ImageAvatarConfig {
  type: "image";
  src: `/images/${string}`;
  alt: string;
  width: number;
  height: number;
}

interface RiveAvatarConfig {
  type: "rive";
  src: `/images/${string}.riv`;
  alt: string;
  artboard?: string;
  stateMachines?: readonly string[];
}

export type RoleAvatarConfig = ImageAvatarConfig | RiveAvatarConfig;

export const DEFAULT_FORM_AVATAR: ImageAvatarConfig = {
  type: "image",
  src: "/images/lapiz-kawaii.png",
  alt: "Lápiz sonriente de la Fábrica de Contenidos",
  width: 1268,
  height: 1240,
};

const ROLE_AVATARS: Record<RoleId, RoleAvatarConfig> = {
  "data-desarrollo": {
    type: "image",
    src: "/images/dev.png",
    alt: "Avatar de Data y Desarrollo",
    width: 1254,
    height: 1254,
  },
  "analistas-marketing": {
    type: "image",
    src: "/images/diseñador.png",
    alt: "Avatar de Analistas de Marketing",
    width: 1254,
    height: 1254,
  },
  gif: {
    type: "image",
    src: "/images/gif.png",
    alt: "Avatar del equipo GIF",
    width: 1254,
    height: 1254,
  },
  presentadoras: {
    type: "image",
    src: "/images/presentador.png",
    alt: "Avatar de Presentadoras",
    width: 1254,
    height: 1254,
  },
  realizadores: {
    type: "image",
    src: "/images/realizador.png",
    alt: "Avatar de Realizadores",
    width: 1254,
    height: 1254,
  },
};

export function getRoleAvatar(roleId: RoleId): RoleAvatarConfig {
  return ROLE_AVATARS[roleId] ?? DEFAULT_FORM_AVATAR;
}

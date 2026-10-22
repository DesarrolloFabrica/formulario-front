export const ROLE_IDS = [
  "data-desarrollo",
  "gif",
  "realizadores",
  "presentadoras",
  "analistas-marketing",
] as const;

export type RoleId = (typeof ROLE_IDS)[number];

export interface RoleConfig {
  id: RoleId;
  name: string;
  shortName: string;
  formPath: `/formularios/${RoleId}`;
}

export const ROLES: Record<RoleId, RoleConfig> = {
  "data-desarrollo": {
    id: "data-desarrollo",
    name: "Data y Desarrollo",
    shortName: "Data y Desarrollo",
    formPath: "/formularios/data-desarrollo",
  },
  gif: {
    id: "gif",
    name: "GIF",
    shortName: "GIF",
    formPath: "/formularios/gif",
  },
  realizadores: {
    id: "realizadores",
    name: "Realizadores",
    shortName: "Realizadores",
    formPath: "/formularios/realizadores",
  },
  presentadoras: {
    id: "presentadoras",
    name: "Presentadoras",
    shortName: "Presentadoras",
    formPath: "/formularios/presentadoras",
  },
  "analistas-marketing": {
    id: "analistas-marketing",
    name: "Analistas de Marketing",
    shortName: "Analistas de Marketing",
    formPath: "/formularios/analistas-marketing",
  },
};

export function isRoleId(value: string): value is RoleId {
  return (ROLE_IDS as readonly string[]).includes(value);
}

export function getRoleConfig(roleId: RoleId): RoleConfig {
  return ROLES[roleId];
}

export function getFormPathForRole(roleId: RoleId): RoleConfig["formPath"] {
  return ROLES[roleId].formPath;
}

import type { AuthUser } from "@/types/auth";
import type { RoleId } from "@/config/roles";

export interface MockUser extends AuthUser {
  password: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "user-data-desarrollo",
    email: "data@fabrica.demo",
    password: "demo1234",
    name: "Ana Data",
    roleId: "data-desarrollo",
    appRole: "participant",
  },
  {
    id: "user-gif",
    email: "gif@fabrica.demo",
    password: "demo1234",
    name: "Carlos GIF",
    roleId: "gif",
    appRole: "participant",
  },
  {
    id: "user-realizadores",
    email: "realizadores@fabrica.demo",
    password: "demo1234",
    name: "Laura Realizadora",
    roleId: "realizadores",
    appRole: "participant",
  },
  {
    id: "user-presentadoras",
    email: "presentadoras@fabrica.demo",
    password: "demo1234",
    name: "María Presentadora",
    roleId: "presentadoras",
    appRole: "participant",
  },
  {
    id: "user-analistas-marketing",
    email: "marketing@fabrica.demo",
    password: "demo1234",
    name: "Diego Marketing",
    roleId: "analistas-marketing",
    appRole: "participant",
  },
];

export function findMockUser(
  email: string,
  password: string
): MockUser | undefined {
  const normalized = email.trim().toLowerCase();
  return MOCK_USERS.find(
    (user) =>
      user.email.toLowerCase() === normalized && user.password === password
  );
}

export function toAuthUser(user: MockUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roleId: user.roleId as RoleId,
    appRole: "participant",
  };
}

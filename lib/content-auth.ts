import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

const MANAGER_ROLES = new Set(["ADMIN", "EDITOR"]);

export function canManageContent(role?: string | null): boolean {
  return role ? MANAGER_ROLES.has(role) : false;
}

export async function getSessionManager() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !canManageContent(session.user.role)) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || !canManageContent(user.role)) {
    return null;
  }

  return {
    userId: user.id,
    role: user.role,
    email: session.user.email,
  };
}

export async function requireSessionManager() {
  const manager = await getSessionManager();

  if (!manager) {
    throw new Error("FORBIDDEN");
  }

  return manager;
}

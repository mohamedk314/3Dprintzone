import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { verifyAdminToken } from "@/lib/auth/jwt";

export type AuthenticatedAdmin = {
  sessionId: string;
  adminUserId: string;
  email: string;
  role: "super_admin" | "admin";
};

export async function getAuthenticatedAdmin(): Promise<AuthenticatedAdmin | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return null;
    }

    const payload = verifyAdminToken(token);

    const session = await prisma.adminSession.findUnique({
      where: { id: payload.sessionId },
      include: {
        adminUser: true,
      },
    });

    if (!session) {
      return null;
    }

    if (session.expiresAt <= new Date()) {
      await prisma.adminSession.deleteMany({
        where: { id: session.id },
      });
      return null;
    }

    if (!session.adminUser.isActive) {
      return null;
    }

    return {
      sessionId: session.id,
      adminUserId: session.adminUserId,
      email: session.adminUser.email,
      role: session.adminUser.role as "super_admin" | "admin",
    };
  } catch {
    return null;
  }
}

export async function requireAuthenticatedAdmin(): Promise<AuthenticatedAdmin> {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    throw new Error("Unauthorized");
  }

  return admin;
}

export async function requireSuperAdmin(): Promise<AuthenticatedAdmin> {
  const admin = await requireAuthenticatedAdmin();

  if (admin.role !== "super_admin") {
    throw new Error("Forbidden: super admin only");
  }

  return admin;
}
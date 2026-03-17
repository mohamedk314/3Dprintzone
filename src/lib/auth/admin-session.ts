import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { verifyAdminToken } from "@/lib/auth/jwt";
import { compareValue } from "@/lib/auth/hash";

export type AuthenticatedAdmin = {
  sessionId: string;
  adminUserId: string;
  email: string;
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
      return null;
    }

    if (!session.adminUser.isActive) {
      return null;
    }

    return {
      sessionId: session.id,
      adminUserId: session.adminUserId,
      email: session.adminUser.email,
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
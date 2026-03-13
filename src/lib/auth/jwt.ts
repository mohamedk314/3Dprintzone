import jwt from "jsonwebtoken";
import { env } from "@/lib/utils/env";

type AdminJwtPayload = {
  sessionId: string;
  adminUserId: string;
  email: string;
};

export function signAdminToken(payload: AdminJwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: `${env.ADMIN_SESSION_EXPIRES_DAYS}d`,
  });
}

export function verifyAdminToken(token: string): AdminJwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as AdminJwtPayload;
}
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { createHash, randomBytes } from "crypto";

const COOKIE_NAME      = "customer_token";
const SESSION_DAYS     = 30;
const OTP_MINUTES      = 10;
const OTP_MAX_ATTEMPTS = 3;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateOtp(): string {
  return String(Math.floor(100000 + (randomBytes(3).readUIntBE(0, 3) % 900000)));
}

export async function createCustomerSession(email: string): Promise<string> {
  const token     = randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  await prisma.customerSession.create({ data: { email, tokenHash, expiresAt } });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });

  return token;
}

export async function getCustomerSession(): Promise<{ email: string } | null> {
  try {
    const cookieStore = await cookies();
    const token       = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const tokenHash = sha256(token);
    const session   = await prisma.customerSession.findUnique({ where: { tokenHash } });
    if (!session || session.expiresAt <= new Date()) {
      if (session) await prisma.customerSession.delete({ where: { tokenHash } });
      return null;
    }

    return { email: session.email };
  } catch {
    return null;
  }
}

export async function clearCustomerSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token       = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      const tokenHash = sha256(token);
      await prisma.customerSession.deleteMany({ where: { tokenHash } }).catch(() => {});
    }
    cookieStore.set(COOKIE_NAME, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  } catch { /* ignore */ }
}

export async function createOtp(email: string): Promise<string> {
  await prisma.customerOtpCode.updateMany({
    where: { email, usedAt: null, expiresAt: { gt: new Date() } },
    data:  { expiresAt: new Date() },
  });

  const code      = generateOtp();
  const codeHash  = sha256(code);
  const expiresAt = new Date(Date.now() + OTP_MINUTES * 60_000);

  await prisma.customerOtpCode.create({ data: { email, codeHash, expiresAt } });
  return code;
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const otpRecord = await prisma.customerOtpCode.findFirst({
    where:   { email, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) return false;

  if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.customerOtpCode.update({ where: { id: otpRecord.id }, data: { expiresAt: new Date() } });
    return false;
  }

  const codeHash = sha256(code);
  if (otpRecord.codeHash !== codeHash) {
    await prisma.customerOtpCode.update({ where: { id: otpRecord.id }, data: { attempts: { increment: 1 } } });
    return false;
  }

  await prisma.customerOtpCode.update({ where: { id: otpRecord.id }, data: { usedAt: new Date() } });
  return true;
}

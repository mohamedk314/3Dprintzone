import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/utils/env";
import { generateOtpCode } from "@/lib/utils/otp";
import { hashValue, compareValue } from "@/lib/auth/hash";
import { sendAdminOtpEmail } from "@/lib/email/admin-otp";
import { signAdminToken } from "@/lib/auth/jwt";

const OTP_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

function isSuperAdminEmail(email: string): boolean {
  return env.SUPER_ADMIN_EMAIL !== "" && email === env.SUPER_ADMIN_EMAIL;
}

function isAllowedAdminEmail(email: string): boolean {
  return env.ADMIN_ALLOWED_EMAILS.includes(email);
}

export async function requestAdminOtp(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const superAdmin = isSuperAdminEmail(normalizedEmail);

  let adminUser = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  if (superAdmin) {
    // Super admin: always allowed; create or repair record
    if (!adminUser) {
      adminUser = await prisma.adminUser.create({
        data: { email: normalizedEmail, role: "super_admin", isActive: true },
      });
    } else {
      // Ensure role and isActive are correct for super admin
      const needsUpdate = adminUser.role !== "super_admin" || !adminUser.isActive;
      if (needsUpdate) {
        adminUser = await prisma.adminUser.update({
          where: { id: adminUser.id },
          data: { role: "super_admin", isActive: true },
        });
      }
    }
  } else if (!adminUser && isAllowedAdminEmail(normalizedEmail)) {
    // Env-allowlisted admin: create on first login
    adminUser = await prisma.adminUser.create({
      data: { email: normalizedEmail, role: "admin", isActive: true },
    });
  } else {
    // Normal admin: must exist and be active (a deactivated record stays
    // locked out even if the email is in ADMIN_ALLOWED_EMAILS)
    if (!adminUser || !adminUser.isActive) {
      if (
        env.SUPER_ADMIN_EMAIL === "" &&
        process.env.NODE_ENV !== "production"
      ) {
        throw new Error(
          "Admin auth is not configured: set SUPER_ADMIN_EMAIL in your .env file"
        );
      }
      throw new Error("Unauthorized: you are not an authorized admin");
    }
  }

  const latestOtp = await prisma.adminOtpCode.findFirst({
    where: { adminUserId: adminUser.id },
    orderBy: { createdAt: "desc" },
  });

  if (latestOtp) {
    const secondsSince = Math.floor(
      (Date.now() - new Date(latestOtp.createdAt).getTime()) / 1000
    );
    if (secondsSince < OTP_COOLDOWN_SECONDS) {
      const wait = OTP_COOLDOWN_SECONDS - secondsSince;
      throw new Error(`Please wait ${wait} seconds before requesting another OTP`);
    }
  }

  // Invalidate any active OTPs
  await prisma.adminOtpCode.updateMany({
    where: { adminUserId: adminUser.id, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });

  const code = generateOtpCode();
  const codeHash = await hashValue(code);
  const expiresMinutes = Math.max(5, env.ADMIN_OTP_EXPIRES_MINUTES);
  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

  await prisma.adminOtpCode.create({
    data: { adminUserId: adminUser.id, codeHash, expiresAt },
  });

  await sendAdminOtpEmail(normalizedEmail, code);

  return { success: true };
}

export async function verifyAdminOtp(email: string, code: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const adminUser = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  if (!adminUser) throw new Error("Admin not found");
  if (!adminUser.isActive) throw new Error("This admin account is deactivated");

  const otpRecord = await prisma.adminOtpCode.findFirst({
    where: { adminUserId: adminUser.id },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) throw new Error("No OTP found. Please request a new code");
  if (otpRecord.usedAt !== null) throw new Error("OTP already used. Please request a new code");
  if (otpRecord.expiresAt <= new Date()) throw new Error("OTP expired. Please request a new code");
  if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) throw new Error("OTP attempts exceeded. Please request a new code");

  const isValid = await compareValue(code, otpRecord.codeHash);

  if (!isValid) {
    const updated = await prisma.adminOtpCode.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });
    if (updated.attempts >= OTP_MAX_ATTEMPTS) {
      throw new Error("OTP attempts exceeded. Please request a new code");
    }
    throw new Error("Invalid OTP");
  }

  await prisma.adminOtpCode.update({
    where: { id: otpRecord.id },
    data: { usedAt: new Date() },
  });

  const sessionExpiresAt = new Date(
    Date.now() + env.ADMIN_SESSION_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  );

  const session = await prisma.adminSession.create({
    data: {
      adminUserId: adminUser.id,
      tokenHash: await hashValue(crypto.randomUUID()),
      expiresAt: sessionExpiresAt,
    },
  });

  const jwtToken = signAdminToken({
    sessionId: session.id,
    adminUserId: adminUser.id,
    email: adminUser.email,
  });

  return {
    success: true,
    token: jwtToken,
    admin: { id: adminUser.id, email: adminUser.email, role: adminUser.role },
  };
}

export async function deleteAdminSessionById(sessionId: string) {
  await prisma.adminSession.deleteMany({ where: { id: sessionId } });
}

import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/utils/env";
import { generateOtpCode } from "@/lib/utils/otp";
import { hashValue, compareValue } from "@/lib/auth/hash";
import { sendAdminOtpEmail } from "@/lib/email/admin-otp";
import { signAdminToken } from "@/lib/auth/jwt";

export async function requestAdminOtp(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail !== env.ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Unauthorized admin email");
  }

  let adminUser = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  if (!adminUser) {
    adminUser = await prisma.adminUser.create({
      data: {
        email: normalizedEmail,
      },
    });
  }

  const code = generateOtpCode();
  const codeHash = await hashValue(code);
  const expiresAt = new Date(Date.now() + env.ADMIN_OTP_EXPIRES_MINUTES * 60 * 1000);

  await prisma.adminOtpCode.create({
    data: {
      adminUserId: adminUser.id,
      codeHash,
      expiresAt,
    },
  });

  await sendAdminOtpEmail(normalizedEmail, code);

  return { success: true };
}

export async function verifyAdminOtp(email: string, code: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const adminUser = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  if (!adminUser) {
    throw new Error("Admin not found");
  }

  const otpRecord = await prisma.adminOtpCode.findFirst({
    where: {
      adminUserId: adminUser.id,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!otpRecord) {
    throw new Error("No valid OTP found");
  }

  const isValid = await compareValue(code, otpRecord.codeHash);

  if (!isValid) {
    await prisma.adminOtpCode.update({
      where: { id: otpRecord.id },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    throw new Error("Invalid OTP");
  }

  await prisma.adminOtpCode.update({
    where: { id: otpRecord.id },
    data: {
      usedAt: new Date(),
    },
  });

  const sessionExpiresAt = new Date(
    Date.now() + env.ADMIN_SESSION_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  );

  const rawSessionToken = crypto.randomUUID();
  const tokenHash = await hashValue(rawSessionToken);

  const session = await prisma.adminSession.create({
    data: {
      adminUserId: adminUser.id,
      tokenHash,
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
    admin: {
      id: adminUser.id,
      email: adminUser.email,
    },
  };
}
function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  DATABASE_URL: getEnv("DATABASE_URL"),
  ADMIN_EMAIL: getEnv("ADMIN_EMAIL"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  ADMIN_OTP_EXPIRES_MINUTES: Number(process.env.ADMIN_OTP_EXPIRES_MINUTES ?? "10"),
  ADMIN_SESSION_EXPIRES_DAYS: Number(process.env.ADMIN_SESSION_EXPIRES_DAYS ?? "7"),
  SMTP_HOST: getEnv("SMTP_HOST"),
  SMTP_PORT: Number(process.env.SMTP_PORT ?? "587"),
  SMTP_USER: getEnv("SMTP_USER"),
  SMTP_PASS: getEnv("SMTP_PASS"),
  SMTP_FROM: getEnv("SMTP_FROM"),
  NEXT_PUBLIC_APP_URL: getEnv("NEXT_PUBLIC_APP_URL"),
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID ?? "",
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ?? "",
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ?? "",
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME ?? "",
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL ?? "",
};
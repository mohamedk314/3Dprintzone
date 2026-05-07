import nodemailer from "nodemailer";
import { env } from "@/lib/utils/env";

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  const to = Array.isArray(params.to) ? params.to.join(", ") : params.to;
  return transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}
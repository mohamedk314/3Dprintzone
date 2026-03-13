import { sendEmail } from "@/lib/email/nodemailer";

export async function sendAdminOtpEmail(email: string, code: string) {
  await sendEmail({
    to: email,
    subject: "Your admin verification code",
    text: `Your verification code is: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Admin verification code</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>This code will expire shortly.</p>
      </div>
    `,
  });
}
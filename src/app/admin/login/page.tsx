"use client";

import { FormEvent, useEffect, useState } from "react";

const RESEND_COOLDOWN_SECONDS = 60;

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function sendOtp(emailValue: string): Promise<boolean> {
    setMessage(null);
    setIsSendingOtp(true);

    try {
      const res = await fetch("/api/admin/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      return true;
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Something went wrong.",
        error: true,
      });
      return false;
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    const ok = await sendOtp(email);
    if (ok) {
      setStep("verify");
      setMessage({ text: "OTP sent. Check your email.", error: false });
    }
  }

  async function handleResendOtp() {
    const ok = await sendOtp(email);
    if (ok) {
      setOtp("");
      setMessage({ text: "New OTP sent. Check your email.", error: false });
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setIsVerifyingOtp(true);

    try {
      const res = await fetch("/api/admin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to verify OTP");
      }

      window.location.href = "/admin";
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Something went wrong.",
        error: true,
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-2xl font-semibold">Admin Login</h1>

        {step === "request" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Admin Email</label>
              <input
                type="email"
                className="w-full rounded border px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSendingOtp}
              className="rounded border px-4 py-2 disabled:opacity-50"
            >
              {isSendingOtp ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Admin Email</label>
              <input
                type="email"
                className="w-full rounded border px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full rounded border px-3 py-2"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isVerifyingOtp}
                className="rounded border px-4 py-2 disabled:opacity-50"
              >
                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isSendingOtp || resendCooldown > 0}
                className="rounded border px-4 py-2 disabled:opacity-50"
              >
                {isSendingOtp
                  ? "Sending..."
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {message ? (
          <p className={`text-sm ${message.error ? "text-red-600" : "text-green-600"}`}>
            {message.text}
          </p>
        ) : null}
      </div>
    </main>
  );
}

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
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      return true;
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Something went wrong.", error: true });
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
      setMessage({ text: "Check your email for the verification code.", error: false });
    }
  }

  async function handleResendOtp() {
    const ok = await sendOtp(email);
    if (ok) {
      setOtp("");
      setMessage({ text: "New code sent. Check your email.", error: false });
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
      if (!res.ok) throw new Error(data.message || "Failed to verify OTP");
      window.location.href = "/admin";
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Something went wrong.", error: true });
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
          </div>
          <h1 className="text-white text-xl font-bold tracking-tight">3Dprintzone</h1>
          <p className="text-gray-500 text-sm mt-1">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-xl">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${step === "request" ? "bg-indigo-600 text-white" : "bg-indigo-600 text-white"}`}>
              {step === "verify" ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : "1"}
            </div>
            <div className={`flex-1 h-px ${step === "verify" ? "bg-indigo-600" : "bg-gray-700"}`} />
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${step === "verify" ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-500"}`}>
              2
            </div>
          </div>

          {step === "request" ? (
            <>
              <h2 className="text-white font-semibold mb-1">Sign in</h2>
              <p className="text-gray-500 text-sm mb-5">Enter your admin email to receive a one-time code.</p>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    autoFocus
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {message && (
                  <div className={`text-xs rounded-lg px-3 py-2.5 ${message.error ? "bg-red-950 border border-red-800 text-red-400" : "bg-green-950 border border-green-800 text-green-400"}`}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
                >
                  {isSendingOtp ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending code...
                    </span>
                  ) : "Send verification code"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-white font-semibold mb-1">Enter your code</h2>
              <p className="text-gray-500 text-sm mb-1">
                We sent a 6-digit code to
              </p>
              <p className="text-indigo-400 text-sm font-medium mb-5 truncate">{email}</p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Verification code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    required
                    autoFocus
                    maxLength={6}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors tracking-widest text-center font-mono text-lg"
                  />
                </div>

                {message && (
                  <div className={`text-xs rounded-lg px-3 py-2.5 ${message.error ? "bg-red-950 border border-red-800 text-red-400" : "bg-green-950 border border-green-800 text-green-400"}`}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifyingOtp || otp.length < 6}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
                >
                  {isVerifyingOtp ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : "Verify & sign in"}
                </button>
              </form>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setStep("request"); setMessage(null); setOtp(""); }}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  ← Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSendingOtp || resendCooldown > 0}
                  className="text-xs text-gray-500 hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {isSendingOtp ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}

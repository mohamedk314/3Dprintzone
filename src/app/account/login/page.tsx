"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") ?? "/account";

  const [step,    setStep]    = useState<"email" | "otp">("email");
  const [email,   setEmail]   = useState("");
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await fetch("/api/customer/auth/request-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) { setStep("otp"); }
    else { const d = await res.json(); setError(d.message ?? "Failed to send code"); }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await fetch("/api/customer/auth/verify-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    setLoading(false);
    if (res.ok) { router.push(redirectTo); }
    else { const d = await res.json(); setError(d.message ?? "Invalid code"); }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Account</h1>
        <p className="text-sm text-gray-500 mb-8">
          {step === "email"
            ? "Enter your email to receive a verification code."
            : `We sent a 6-digit code to ${email}.`}
        </p>

        {step === "email" ? (
          <form onSubmit={requestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email" required autoFocus
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="you@example.com"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60">
              {loading ? "Sending…" : "Send Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Verification code</label>
              <input
                type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoFocus
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-center tracking-widest font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="000000"
              />
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 leading-relaxed">
              Can&apos;t find the code? Please check your <strong>spam or junk folder</strong>.
            </p>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60">
              {loading ? "Verifying…" : "Verify Code"}
            </button>
            <button type="button" onClick={() => { setStep("email"); setCode(""); setError(""); }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors">
              ← Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AccountLoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

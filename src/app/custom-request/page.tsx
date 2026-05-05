"use client";

import { useState } from "react";
import Link from "next/link";

type RequestType = "architecture" | "gift" | "dental" | "mechanical" | "";

const REQUEST_TYPES: { value: RequestType; label: string; desc: string; icon: string }[] = [
  { value: "architecture", label: "Architecture",  desc: "Scale models, building replicas, site layouts", icon: "🏛️" },
  { value: "gift",         label: "Custom Gifts",  desc: "Personalized gifts, figurines, keepsakes",    icon: "🎁" },
  { value: "dental",       label: "Dental",        desc: "Dental models, guides, surgical templates",   icon: "🦷" },
  { value: "mechanical",   label: "Mechanical",    desc: "Parts, prototypes, enclosures, brackets",     icon: "⚙️" },
];

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  requestType: RequestType;
  description: string;
  referenceUrl: string;
}

export default function CustomRequestPage() {
  const [form, setForm] = useState<FormState>({
    fullName: "", email: "", phone: "",
    requestType: "", description: "", referenceUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.requestType) { setError("Please select a request type"); return; }
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/storefront/custom-requests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          requestType: form.requestType,
          description: form.description,
          referenceUrl: form.referenceUrl || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to submit. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
          ✅
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Request Submitted!</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          We've received your custom request. Our team will review it and contact you within 24 hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-indigo-700 transition-colors">
            Back to Home
          </Link>
          <a
            href="https://wa.me/201012708316"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-green-500 text-green-600 font-bold px-6 py-2.5 rounded-full hover:bg-green-50 transition-colors"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Custom 3D Print Request</h1>
        <p className="text-gray-500">Tell us what you need and we'll bring it to life</p>
      </div>

      {/* Info strip */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: "📐", label: "Describe your idea" },
          { icon: "💬", label: "We'll quote you" },
          { icon: "🚚", label: "Print & deliver" },
        ].map((step) => (
          <div key={step.label} className="bg-indigo-50 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">{step.icon}</div>
            <p className="text-xs font-medium text-indigo-700">{step.label}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Your Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Full Name *</label>
              <input
                required
                type="text"
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                placeholder="Ahmed Mohamed"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Email *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="ahmed@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Phone *</label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Request type */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">What do you need? *</h2>
          <div className="grid grid-cols-2 gap-3">
            {REQUEST_TYPES.map((type) => (
              <label
                key={type.value}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  form.requestType === type.value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="requestType"
                  value={type.value}
                  checked={form.requestType === type.value}
                  onChange={() => setField("requestType", type.value)}
                  className="hidden"
                />
                <span className="text-2xl shrink-0">{type.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{type.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-tight">{type.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Describe Your Request *</h2>
          <textarea
            required
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={5}
            placeholder="Describe what you need as clearly as possible. Include dimensions, materials, colors, quantity, or any special requirements..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 resize-none"
          />
          <p className="text-xs text-gray-400 mt-2">
            The more detail you provide, the better and faster we can give you a quote.
          </p>
          <div className="mt-4">
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Reference URL (optional)
            </label>
            <input
              type="url"
              value={form.referenceUrl}
              onChange={(e) => setField("referenceUrl", e.target.value)}
              placeholder="https://example.com/design-reference"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
            />
            <p className="text-xs text-gray-400 mt-1">Link to an image, 3D model, or reference design</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-base"
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>

        <p className="text-center text-xs text-gray-400">
          We typically respond within 24 hours.{" "}
          <a href="https://wa.me/201012708316" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
            WhatsApp us
          </a>{" "}
          for urgent requests.
        </p>
      </form>
    </div>
  );
}

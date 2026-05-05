"use client";

import { useEffect, useState, FormEvent } from "react";

type ShippingType = "fixed" | "discussed";

interface ShippingConfig { type: ShippingType; amount: number }

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);

  // Shipping
  const [shippingSaving, setShippingSaving] = useState(false);
  const [shippingMsg, setShippingMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [type, setType] = useState<ShippingType>("fixed");
  const [amount, setAmount] = useState("0");

  // Announcement
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [announcementText, setAnnouncementText] = useState("Free delivery on orders above 500 EGP");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/settings/shipping")
        .then((r) => r.json())
        .then((d: { success: boolean; data: ShippingConfig }) => {
          if (d.success) { setType(d.data.type); setAmount(String(d.data.amount)); }
        }),
      fetch("/api/storefront/announcement")
        .then((r) => r.json())
        .then((d: { success: boolean; data: { text: string } }) => {
          if (d.success) setAnnouncementText(d.data.text);
        }),
    ]).finally(() => setLoading(false));
  }, []);

  async function handleShippingSubmit(e: FormEvent) {
    e.preventDefault();
    setShippingSaving(true);
    setShippingMsg(null);
    try {
      const res = await fetch("/api/admin/settings/shipping", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, amount: type === "fixed" ? Number(amount) : 0 }),
      });
      const data = await res.json();
      setShippingMsg({ text: data.success ? "Shipping settings saved." : (data.message || "Failed to save."), ok: data.success });
    } catch {
      setShippingMsg({ text: "Network error.", ok: false });
    } finally {
      setShippingSaving(false);
      setTimeout(() => setShippingMsg(null), 4000);
    }
  }

  async function handleAnnouncementSubmit(e: FormEvent) {
    e.preventDefault();
    setAnnouncementSaving(true);
    setAnnouncementMsg(null);
    try {
      const res = await fetch("/api/admin/settings/announcement", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: announcementText }),
      });
      const data = await res.json();
      setAnnouncementMsg({ text: data.success ? "Announcement saved." : (data.message || "Failed to save."), ok: data.success });
    } catch {
      setAnnouncementMsg({ text: "Network error.", ok: false });
    } finally {
      setAnnouncementSaving(false);
      setTimeout(() => setAnnouncementMsg(null), 4000);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage store-wide configuration.</p>
      </div>

      {/* Top Bar Announcement */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-1">Top Bar Announcement</h2>
        <p className="text-xs text-gray-400 mb-4">
          The text shown in the dark bar at the top of every storefront page.
        </p>
        {loading ? (
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <form onSubmit={handleAnnouncementSubmit} className="space-y-3">
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              maxLength={120}
              placeholder="Free delivery on orders above 500 EGP"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={announcementSaving}
                className="bg-indigo-600 text-white font-semibold text-sm px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {announcementSaving ? "Saving..." : "Save"}
              </button>
              {announcementMsg && (
                <p className={`text-xs ${announcementMsg.ok ? "text-green-600" : "text-red-600"}`}>
                  {announcementMsg.text}
                </p>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Shipping Fee */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-1">Shipping Fee</h2>
        <p className="text-xs text-gray-400 mb-5">
          Choose how shipping is presented to customers at checkout.
        </p>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-14 bg-gray-100 rounded-xl" />
            <div className="h-14 bg-gray-100 rounded-xl" />
          </div>
        ) : (
          <form onSubmit={handleShippingSubmit} className="space-y-4">
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              type === "fixed" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
            }`}>
              <input type="radio" name="shippingType" value="fixed" checked={type === "fixed"}
                onChange={() => setType("fixed")} className="mt-0.5 accent-indigo-600" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">Fixed Amount</p>
                <p className="text-xs text-gray-500 mt-0.5">Set a specific shipping fee shown to all customers.</p>
                {type === "fixed" && (
                  <div className="mt-3 flex items-center gap-2">
                    <input type="number" min={0} step="1" value={amount}
                      onChange={(e) => setAmount(e.target.value)} placeholder="0"
                      className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
                    <span className="text-sm text-gray-500">EGP</span>
                    {Number(amount) === 0 && (
                      <span className="text-xs text-green-600 font-medium">( Free shipping )</span>
                    )}
                  </div>
                )}
              </div>
            </label>

            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              type === "discussed" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
            }`}>
              <input type="radio" name="shippingType" value="discussed" checked={type === "discussed"}
                onChange={() => setType("discussed")} className="mt-0.5 accent-indigo-600" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">To be Discussed</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  For large or custom items (e.g. 3D printers). Customers see &ldquo;To be discussed&rdquo; and you confirm the cost after the order.
                </p>
              </div>
            </label>

            {shippingMsg && (
              <p className={`text-xs rounded-lg px-3 py-2 ${shippingMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {shippingMsg.text}
              </p>
            )}

            <button type="submit" disabled={shippingSaving}
              className="bg-indigo-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {shippingSaving ? "Saving..." : "Save Settings"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

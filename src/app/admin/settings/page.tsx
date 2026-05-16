"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DEFAULT_SITE_SETTINGS,
  LEGAL_PAGE_SLUGS,
  type LegalPage,
  type LegalPageSlug,
  type RaykSettings,
  type SiteSettings,
} from "@/lib/services/site-settings-types";

type Tab = "general" | "printzone" | "rayk";

const TABS: { value: Tab; label: string; sub: string }[] = [
  { value: "general", label: "General Settings", sub: "Shared contact + global defaults" },
  { value: "printzone", label: "3dprintzone", sub: "Main brand landing & legal pages" },
  { value: "rayk", label: "RAYK", sub: "Sub-brand landing & legal pages" },
];

type ShippingType = "fixed" | "discussed";
interface ShippingConfig { type: ShippingType; amount: number }

type Flash = { text: string; ok: boolean } | null;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function fieldLabel(label: string, hint?: string) {
  return (
    <label className="block mb-1">
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      {hint && <span className="block text-[11px] text-gray-400 mt-0.5 font-normal">{hint}</span>}
    </label>
  );
}

interface ImageFieldProps {
  label: string;
  hint?: string;
  value: string;
  alt: string;
  onChange: (url: string) => void;
  onAltChange: (alt: string) => void;
}

function ImageField({ label, hint, value, alt, onChange, onAltChange }: ImageFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErr("Only JPEG, PNG, or WebP images.");
      return;
    }
    setErr(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads/r2/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Upload failed");
      onChange(data.imageUrl);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/40 space-y-3">
      <div>
        {fieldLabel(label, hint)}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-lg border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
            {value ? (
              <Image
                src={value}
                alt={alt || label}
                fill
                className="object-contain p-2"
                sizes="112px"
                unoptimized
              />
            ) : (
              <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/3dprinter.png  or  https://…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-400 transition-colors font-mono"
            />
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                }}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-50 transition-colors press"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {uploading ? "Uploading…" : value ? "Replace" : "Upload Image"}
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1.5"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              PNG, JPG, or WEBP. Uploads go to your R2 bucket. You can also paste a direct URL or a path under /public.
            </p>
            {err && <p className="text-xs text-red-600">{err}</p>}
          </div>
        </div>
      </div>
      <div>
        {fieldLabel("Image alt text", "Used by screen readers and SEO.")}
        <input
          type="text"
          value={alt}
          onChange={(e) => onAltChange(e.target.value)}
          placeholder="e.g. 3D Printer"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
        />
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6">
      <header className="mb-5">
        <h2 className="font-semibold text-gray-900 text-base">{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      {fieldLabel(label, hint)}
      {children}
    </div>
  );
}

type AccessState = "checking" | "ok" | "denied";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<AccessState>("checking");

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && d.admin?.role === "super_admin") setAccess("ok");
        else setAccess("denied");
      })
      .catch(() => setAccess("denied"));
  }, []);

  // Site settings (homepage + business)
  const [site, setSite] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [siteSaving, setSiteSaving] = useState(false);
  const [siteMsg, setSiteMsg] = useState<Flash>(null);

  // Shipping
  const [shippingSaving, setShippingSaving] = useState(false);
  const [shippingMsg, setShippingMsg] = useState<Flash>(null);
  const [type, setType] = useState<ShippingType>("fixed");
  const [amount, setAmount] = useState("0");

  // Announcement
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState<Flash>(null);
  const [announcementText, setAnnouncementText] = useState("Free delivery on orders above 500 EGP");

  useEffect(() => {
    if (access !== "ok") return;
    Promise.all([
      fetch("/api/admin/settings/site")
        .then((r) => r.json())
        .then((d) => { if (d.success && d.data) setSite(d.data); }),
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
  }, [access]);

  function flashSite(text: string, ok: boolean) {
    setSiteMsg({ text, ok });
    setTimeout(() => setSiteMsg(null), 4500);
  }

  async function handleSiteSubmit(e: FormEvent) {
    e.preventDefault();
    setSiteSaving(true);
    try {
      const res = await fetch("/api/admin/settings/site", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });
      const data = await res.json();
      if (data.success) {
        setSite(data.data);
        flashSite("Homepage & business settings saved.", true);
      } else {
        flashSite(data.message || "Failed to save.", false);
      }
    } catch {
      flashSite("Network error.", false);
    } finally {
      setSiteSaving(false);
    }
  }

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

  // ── Field updaters ──────────────────────────────────────────────────────
  function patchContact<K extends keyof SiteSettings["contact"]>(key: K, value: SiteSettings["contact"][K]) {
    setSite((s) => ({ ...s, contact: { ...s.contact, [key]: value } }));
  }
  function patchHero<K extends keyof SiteSettings["hero"]>(key: K, value: SiteSettings["hero"][K]) {
    setSite((s) => ({ ...s, hero: { ...s.hero, [key]: value } }));
  }
  function patchCard(index: number, field: keyof SiteSettings["heroCards"][number], value: string) {
    setSite((s) => {
      const next = [...s.heroCards] as SiteSettings["heroCards"];
      next[index] = { ...next[index], [field]: value };
      return { ...s, heroCards: next };
    });
  }
  function patchBadge(index: number, field: keyof SiteSettings["trustBadges"][number], value: string) {
    setSite((s) => {
      const next = [...s.trustBadges] as SiteSettings["trustBadges"];
      next[index] = { ...next[index], [field]: value };
      return { ...s, trustBadges: next };
    });
  }
  function patchCta<K extends keyof SiteSettings["customCta"]>(key: K, value: SiteSettings["customCta"][K]) {
    setSite((s) => ({ ...s, customCta: { ...s.customCta, [key]: value } }));
  }
  function patchFooter<K extends keyof SiteSettings["footer"]>(key: K, value: SiteSettings["footer"][K]) {
    setSite((s) => ({ ...s, footer: { ...s.footer, [key]: value } }));
  }
  function patchLegalPage<K extends keyof LegalPage>(slug: LegalPageSlug, key: K, value: LegalPage[K]) {
    setSite((s) => ({
      ...s,
      legalPages: { ...s.legalPages, [slug]: { ...s.legalPages[slug], [key]: value } },
    }));
  }
  function patchContactPage<K extends keyof SiteSettings["contactPage"]>(key: K, value: SiteSettings["contactPage"][K]) {
    setSite((s) => ({ ...s, contactPage: { ...s.contactPage, [key]: value } }));
  }
  function patchSeo<K extends keyof SiteSettings["seo"]>(key: K, value: SiteSettings["seo"][K]) {
    setSite((s) => ({ ...s, seo: { ...s.seo, [key]: value } }));
  }
  function patchPrintzoneSeo<K extends keyof SiteSettings["printzoneSeo"]>(key: K, value: SiteSettings["printzoneSeo"][K]) {
    setSite((s) => ({ ...s, printzoneSeo: { ...s.printzoneSeo, [key]: value } }));
  }
  function patchMaintenance<K extends keyof SiteSettings["maintenance"]>(key: K, value: SiteSettings["maintenance"][K]) {
    setSite((s) => ({ ...s, maintenance: { ...s.maintenance, [key]: value } }));
  }

  // ── RAYK patch helpers ──
  function patchRaykHero<K extends keyof RaykSettings["hero"]>(key: K, value: RaykSettings["hero"][K]) {
    setSite((s) => ({ ...s, rayk: { ...s.rayk, hero: { ...s.rayk.hero, [key]: value } } }));
  }
  function patchRaykFeatureArr(
    arr: "heroFeatures" | "benefits" | "bottomFeatures",
    index: number,
    field: "title" | "subtitle",
    value: string
  ) {
    setSite((s) => {
      const next = [...s.rayk[arr]] as RaykSettings["heroFeatures"];
      next[index] = { ...next[index], [field]: value };
      return { ...s, rayk: { ...s.rayk, [arr]: next } };
    });
  }
  function patchRaykSections<K extends keyof RaykSettings["sections"]>(key: K, value: RaykSettings["sections"][K]) {
    setSite((s) => ({ ...s, rayk: { ...s.rayk, sections: { ...s.rayk.sections, [key]: value } } }));
  }
  function patchRaykFixture<K extends keyof RaykSettings["lightingFixtures"][number]>(
    index: number,
    key: K,
    value: RaykSettings["lightingFixtures"][number][K]
  ) {
    setSite((s) => {
      const next = [...s.rayk.lightingFixtures] as RaykSettings["lightingFixtures"];
      next[index] = { ...next[index], [key]: value };
      return { ...s, rayk: { ...s.rayk, lightingFixtures: next } };
    });
  }
  function patchRaykAnnouncement<K extends keyof RaykSettings["announcement"]>(key: K, value: RaykSettings["announcement"][K]) {
    setSite((s) => ({ ...s, rayk: { ...s.rayk, announcement: { ...s.rayk.announcement, [key]: value } } }));
  }
  function patchRaykFooter<K extends keyof RaykSettings["footer"]>(key: K, value: RaykSettings["footer"][K]) {
    setSite((s) => ({ ...s, rayk: { ...s.rayk, footer: { ...s.rayk.footer, [key]: value } } }));
  }
  function patchRaykSeo<K extends keyof RaykSettings["seo"]>(key: K, value: RaykSettings["seo"][K]) {
    setSite((s) => ({ ...s, rayk: { ...s.rayk, seo: { ...s.rayk.seo, [key]: value } } }));
  }
  function patchRaykContactOverride<K extends keyof RaykSettings["contactOverrides"]>(
    key: K, value: RaykSettings["contactOverrides"][K]
  ) {
    setSite((s) => ({ ...s, rayk: { ...s.rayk, contactOverrides: { ...s.rayk.contactOverrides, [key]: value } } }));
  }
  function patchRaykLegalPage<K extends keyof LegalPage>(slug: LegalPageSlug, key: K, value: LegalPage[K]) {
    setSite((s) => ({
      ...s,
      rayk: {
        ...s.rayk,
        legalPages: { ...s.rayk.legalPages, [slug]: { ...s.rayk.legalPages[slug], [key]: value } },
      },
    }));
  }
  function patchRaykContactPage<K extends keyof RaykSettings["contactPage"]>(
    key: K, value: RaykSettings["contactPage"][K]
  ) {
    setSite((s) => ({ ...s, rayk: { ...s.rayk, contactPage: { ...s.rayk.contactPage, [key]: value } } }));
  }

  const [tab, setTab] = useState<Tab>("general");

  const legalSlugLabels: Record<LegalPageSlug, { route: string; description: string }> = {
    "privacy-policy": { route: "/privacy-policy", description: "How customer data is collected, used, and protected." },
    "terms": { route: "/terms", description: "Terms of using the site and purchasing products." },
    "refund-policy": { route: "/refund-policy", description: "Refunds, returns, and how to request them." },
    "shipping-policy": { route: "/shipping-policy", description: "Delivery times, fees, and coverage areas." },
  };

  const raykLegalSlugLabels: Record<LegalPageSlug, { route: string; description: string }> = {
    "privacy-policy": { route: "/rayk/privacy-policy", description: "How customer data is handled on RAYK." },
    "terms": { route: "/rayk/terms", description: "Terms of using RAYK and purchasing products." },
    "refund-policy": { route: "/rayk/refund-policy", description: "RAYK refunds and returns policy." },
    "shipping-policy": { route: "/rayk/shipping-policy", description: "RAYK delivery and shipping details." },
  };

  if (access === "checking") {
    return (
      <div className="p-4 sm:p-6 max-w-3xl space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
            <div className="h-4 w-40 bg-gray-100 rounded mb-3" />
            <div className="h-8 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (access === "denied") {
    return (
      <div className="p-4 sm:p-6 max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-100 p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-1">Access denied</h1>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5">
            Only a <span className="font-semibold text-gray-700">super admin</span> can view and edit store settings. Ask a super admin to grant you access if you need it.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors press"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
            <div className="h-4 w-40 bg-gray-100 rounded mb-3" />
            <div className="h-8 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 transition-colors";
  const textareaCls = inputCls + " resize-none";

  return (
    <div className="p-4 sm:p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Edit business contact, both brand homepages, legal pages, and shipping. Saves apply across the storefront.</p>
      </div>

      {/* ── Tabs ── */}
      <div role="tablist" aria-label="Settings tabs" className="bg-white rounded-xl border border-gray-100 p-1 grid grid-cols-3 gap-1 sticky top-2 z-20 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
        {TABS.map((t) => {
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.value)}
              className={`text-left px-3 sm:px-4 py-2.5 rounded-lg transition-colors press ${
                active
                  ? "bg-indigo-600 text-white shadow-[0_2px_8px_-2px_rgba(99,102,241,0.5)]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className={`block text-xs sm:text-sm font-semibold ${active ? "text-white" : "text-gray-900"}`}>
                {t.label}
              </span>
              <span className={`hidden sm:block text-[10px] mt-0.5 truncate ${active ? "text-indigo-100/90" : "text-gray-400"}`}>
                {t.sub}
              </span>
            </button>
          );
        })}
      </div>

      {tab === "general" && (
        <>
      {/* ── Top Bar Announcement ── */}
      <Section
        title="Top Bar Announcement"
        description="Shown in the dark bar at the top of every storefront page (shared across brands)."
      >
        <form onSubmit={handleAnnouncementSubmit} className="space-y-3">
          <input
            type="text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            maxLength={120}
            placeholder="Free delivery on orders above 500 EGP"
            className={inputCls}
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={announcementSaving}
              className="bg-indigo-600 text-white font-semibold text-sm px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors press"
            >
              {announcementSaving ? "Saving..." : "Save"}
            </button>
            {announcementMsg && (
              <p className={`text-xs anim-fade-slide-in ${announcementMsg.ok ? "text-green-600" : "text-red-600"}`}>
                {announcementMsg.text}
              </p>
            )}
          </div>
        </form>
      </Section>
        </>
      )}

      {/* ─────── Homepage & business settings (form wraps all 3 tabs) ─────── */}
      <form onSubmit={handleSiteSubmit} className="space-y-6">

      {tab === "general" && (
        <>
        {/* Business Contact */}
        <Section
          title="Business Contact"
          description="Phone number, email, address, and social links shown across the storefront."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Contact Phone *" hint="Shown in the top bar and footer.">
              <input
                type="tel"
                value={site.contact.phone}
                onChange={(e) => patchContact("phone", e.target.value)}
                placeholder="+201012708316"
                className={inputCls}
              />
            </Field>
            <Field label="WhatsApp Phone *" hint="Digits only, used for wa.me links.">
              <input
                type="tel"
                value={site.contact.whatsappPhone}
                onChange={(e) => patchContact("whatsappPhone", e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="201012708316"
                className={inputCls}
              />
            </Field>
            <Field label="Email" hint="Shown in the footer.">
              <input
                type="email"
                value={site.contact.email}
                onChange={(e) => patchContact("email", e.target.value)}
                placeholder="info@3dprintzone.com"
                className={inputCls}
              />
            </Field>
            <Field label="Address / Region" hint="Short label shown next to the address pin.">
              <input
                type="text"
                value={site.contact.address}
                onChange={(e) => patchContact("address", e.target.value)}
                placeholder="Egypt"
                className={inputCls}
              />
            </Field>
            <Field label="Instagram URL">
              <input
                type="url"
                value={site.contact.instagramUrl}
                onChange={(e) => patchContact("instagramUrl", e.target.value)}
                placeholder="https://instagram.com/3dprintzone.eg"
                className={inputCls}
              />
            </Field>
            <Field label="Instagram Handle">
              <input
                type="text"
                value={site.contact.instagramHandle}
                onChange={(e) => patchContact("instagramHandle", e.target.value)}
                placeholder="@3dprintzone.eg"
                className={inputCls}
              />
            </Field>
            <Field label="InstaPay Handle" hint="Shown to customers selecting InstaPay at checkout.">
              <input
                type="text"
                value={site.contact.instapayHandle}
                onChange={(e) => patchContact("instapayHandle", e.target.value)}
                placeholder="3dprintzone@instapay"
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        {/* Global SEO defaults */}
        <Section
          title="Global SEO Defaults"
          description="Fallback meta title, description, and Open Graph image used by pages that don't set their own."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Meta title">
              <input
                type="text"
                value={site.seo.metaTitle}
                onChange={(e) => patchSeo("metaTitle", e.target.value)}
                maxLength={120}
                className={inputCls}
              />
            </Field>
            <Field label="OG image URL" hint="Shown when the site is shared on social media.">
              <input
                type="text"
                value={site.seo.ogImage}
                onChange={(e) => patchSeo("ogImage", e.target.value)}
                placeholder="/hero.png  or  https://…"
                className={inputCls + " font-mono text-xs"}
              />
            </Field>
          </div>
          <Field label="Meta description">
            <textarea
              value={site.seo.metaDescription}
              onChange={(e) => patchSeo("metaDescription", e.target.value)}
              maxLength={240}
              rows={2}
              className={textareaCls}
            />
          </Field>
        </Section>

        {/* Maintenance */}
        <Section
          title="Maintenance Mode"
          description="Replaces every public storefront page with a maintenance screen. Admin pages, admin APIs, and static assets are not affected — super admins can still log in and turn it off."
        >
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              site.maintenance.enabled
                ? "border-amber-400 bg-amber-50/60"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="checkbox"
              checked={site.maintenance.enabled}
              onChange={(e) => patchMaintenance("enabled", e.target.checked)}
              className="mt-0.5 accent-amber-500"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">
                {site.maintenance.enabled ? "Maintenance mode is ON" : "Maintenance mode is OFF"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {site.maintenance.enabled
                  ? "Public visitors see a maintenance page until you turn this off."
                  : "Toggle on to take the storefront offline for visitors while you work."}
              </p>
            </div>
          </label>

          <Field label="Maintenance title" hint="Headline on the maintenance page.">
            <input
              type="text"
              value={site.maintenance.title}
              onChange={(e) => patchMaintenance("title", e.target.value)}
              maxLength={80}
              placeholder="We'll be right back"
              className={inputCls}
            />
          </Field>
          <Field label="Maintenance message" hint="Shown to visitors while maintenance is on.">
            <textarea
              value={site.maintenance.message}
              onChange={(e) => patchMaintenance("message", e.target.value)}
              maxLength={600}
              rows={4}
              className={textareaCls}
            />
          </Field>
          <Field label="Expected-back note" hint="Optional. e.g. 'Back at 14:00 Cairo time'. Leave empty to hide.">
            <input
              type="text"
              value={site.maintenance.expectedBackText}
              onChange={(e) => patchMaintenance("expectedBackText", e.target.value)}
              maxLength={200}
              placeholder=""
              className={inputCls}
            />
          </Field>
        </Section>
        </>
      )}

      {tab === "printzone" && (
        <>
        {/* Hero */}
        <Section
          title="Homepage Hero"
          description="The first section visitors see — headline, subtitle, badge, CTA buttons, and the main printer image."
        >
          <Field label="Badge text" hint="Small pill above the headline.">
            <input
              type="text"
              value={site.hero.badge}
              onChange={(e) => patchHero("badge", e.target.value)}
              maxLength={80}
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Headline — line 1">
              <input
                type="text"
                value={site.hero.titleLine1}
                onChange={(e) => patchHero("titleLine1", e.target.value)}
                maxLength={60}
                className={inputCls}
              />
            </Field>
            <Field label="Headline — line 2" hint="Rendered in the orange gradient.">
              <input
                type="text"
                value={site.hero.titleLine2}
                onChange={(e) => patchHero("titleLine2", e.target.value)}
                maxLength={60}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Subtitle">
            <textarea
              value={site.hero.subtitle}
              onChange={(e) => patchHero("subtitle", e.target.value)}
              maxLength={240}
              rows={2}
              className={textareaCls}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Primary button text">
              <input type="text" value={site.hero.primaryCtaText} onChange={(e) => patchHero("primaryCtaText", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Primary button link">
              <input type="text" value={site.hero.primaryCtaHref} onChange={(e) => patchHero("primaryCtaHref", e.target.value)} placeholder="/shop" className={inputCls} />
            </Field>
            <Field label="Secondary button text">
              <input type="text" value={site.hero.secondaryCtaText} onChange={(e) => patchHero("secondaryCtaText", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Secondary button link">
              <input type="text" value={site.hero.secondaryCtaHref} onChange={(e) => patchHero("secondaryCtaHref", e.target.value)} placeholder="/custom-request" className={inputCls} />
            </Field>
          </div>
          <ImageField
            label="Main 3D printer image"
            hint="Large hero image on the right of the homepage."
            value={site.hero.printerImageUrl}
            alt={site.hero.printerImageAlt}
            onChange={(url) => patchHero("printerImageUrl", url)}
            onAltChange={(alt) => patchHero("printerImageAlt", alt)}
          />
        </Section>

        {/* Hero cards — the 4 surrounding images */}
        <Section
          title="Surrounding Hero Cards"
          description="The four product cards floating around the 3D printer. Edit the image and the small text under it."
        >
          <div className="grid grid-cols-1 gap-4">
            {site.heroCards.map((card, i) => {
              const position = ["Top-left", "Top-right", "Bottom-left", "Bottom-right"][i] ?? `Card ${i + 1}`;
              return (
                <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">{position}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Title">
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => patchCard(i, "title", e.target.value)}
                        maxLength={60}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Subtitle">
                      <input
                        type="text"
                        value={card.subtitle}
                        onChange={(e) => patchCard(i, "subtitle", e.target.value)}
                        maxLength={80}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <ImageField
                    label="Card image"
                    value={card.imageUrl}
                    alt={card.imageAlt}
                    onChange={(url) => patchCard(i, "imageUrl", url)}
                    onAltChange={(alt) => patchCard(i, "imageAlt", alt)}
                  />
                </div>
              );
            })}
          </div>
        </Section>

        {/* Trust badges */}
        <Section
          title="Trust Badges"
          description="The four mini cards that sit in the white strip below the hero (icons are fixed; only the text is editable)."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {site.trustBadges.map((b, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Badge {i + 1}</p>
                <Field label="Title">
                  <input
                    type="text"
                    value={b.title}
                    onChange={(e) => patchBadge(i, "title", e.target.value)}
                    maxLength={40}
                    className={inputCls}
                  />
                </Field>
                <Field label="Subtitle">
                  <input
                    type="text"
                    value={b.subtitle}
                    onChange={(e) => patchBadge(i, "subtitle", e.target.value)}
                    maxLength={60}
                    className={inputCls}
                  />
                </Field>
              </div>
            ))}
          </div>
        </Section>

        {/* Custom CTA */}
        <Section
          title="Custom Request CTA Section"
          description="The orange call-to-action block near the bottom of the homepage."
        >
          <Field label="Title">
            <input
              type="text"
              value={site.customCta.title}
              onChange={(e) => patchCta("title", e.target.value)}
              maxLength={80}
              className={inputCls}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={site.customCta.description}
              onChange={(e) => patchCta("description", e.target.value)}
              maxLength={320}
              rows={3}
              className={textareaCls}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Button text">
              <input
                type="text"
                value={site.customCta.buttonText}
                onChange={(e) => patchCta("buttonText", e.target.value)}
                maxLength={40}
                className={inputCls}
              />
            </Field>
            <Field label="Button link">
              <input
                type="text"
                value={site.customCta.buttonHref}
                onChange={(e) => patchCta("buttonHref", e.target.value)}
                placeholder="/custom-request"
                className={inputCls}
              />
            </Field>
          </div>
        </Section>
        </>
      )}

      {tab === "general" && (
        <>
        {/* Contact Page */}
        <Section
          title="Contact Page (/contact)"
          description="Content shown on the public /contact page. Phone, email, and social links come from the Business Contact section above."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Page title">
              <input
                type="text"
                value={site.contactPage.title}
                onChange={(e) => patchContactPage("title", e.target.value)}
                maxLength={80}
                className={inputCls}
              />
            </Field>
            <Field label="Meta title" hint="Used in the browser tab and SEO.">
              <input
                type="text"
                value={site.contactPage.metaTitle}
                onChange={(e) => patchContactPage("metaTitle", e.target.value)}
                maxLength={80}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Meta description" hint="Shown by search engines under the page title.">
            <textarea
              value={site.contactPage.metaDescription}
              onChange={(e) => patchContactPage("metaDescription", e.target.value)}
              maxLength={200}
              rows={2}
              className={textareaCls}
            />
          </Field>
          <Field label="Intro paragraph" hint="Short sentence shown under the page heading.">
            <textarea
              value={site.contactPage.intro}
              onChange={(e) => patchContactPage("intro", e.target.value)}
              maxLength={1000}
              rows={3}
              className={textareaCls}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Working hours">
              <input
                type="text"
                value={site.contactPage.workingHours}
                onChange={(e) => patchContactPage("workingHours", e.target.value)}
                maxLength={200}
                placeholder="Sunday – Thursday, 10:00 – 18:00"
                className={inputCls}
              />
            </Field>
            <Field label="Map embed URL" hint="Paste a Google Maps embed URL (optional).">
              <input
                type="url"
                value={site.contactPage.mapEmbedUrl}
                onChange={(e) => patchContactPage("mapEmbedUrl", e.target.value)}
                maxLength={500}
                placeholder="https://www.google.com/maps/embed?…"
                className={inputCls}
              />
            </Field>
          </div>
        </Section>
        </>
      )}

      {tab === "printzone" && (
        <>
        {/* 3dprintzone SEO override */}
        <Section
          title="3dprintzone Homepage SEO"
          description="Page title, description and OG image used for the main 3dprintzone landing page."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Meta title">
              <input
                type="text"
                value={site.printzoneSeo.metaTitle}
                onChange={(e) => patchPrintzoneSeo("metaTitle", e.target.value)}
                maxLength={120}
                className={inputCls}
              />
            </Field>
            <Field label="OG image URL">
              <input
                type="text"
                value={site.printzoneSeo.ogImage}
                onChange={(e) => patchPrintzoneSeo("ogImage", e.target.value)}
                placeholder="/hero.png  or  https://…"
                className={inputCls + " font-mono text-xs"}
              />
            </Field>
          </div>
          <Field label="Meta description">
            <textarea
              value={site.printzoneSeo.metaDescription}
              onChange={(e) => patchPrintzoneSeo("metaDescription", e.target.value)}
              maxLength={240}
              rows={2}
              className={textareaCls}
            />
          </Field>
        </Section>

        {/* Legal & Basic Pages */}
        <Section
          title="3dprintzone Legal & Basic Pages"
          description="Privacy policy, terms, refund policy, and shipping policy for the main 3dprintzone storefront. Each has its own public route at /<slug> and editable SEO metadata. Content is plain text — blank lines separate paragraphs, and a short line followed by more text becomes a subheading."
        >
          <div className="space-y-5">
            {LEGAL_PAGE_SLUGS.map((slug) => {
              const page = site.legalPages[slug];
              const meta = legalSlugLabels[slug];
              return (
                <div key={slug} className="border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">{meta.route}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{meta.description}</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={page.enabled}
                        onChange={(e) => patchLegalPage(slug, "enabled", e.target.checked)}
                        className="accent-indigo-600"
                      />
                      {page.enabled ? "Published" : "Hidden"}
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Page title">
                      <input
                        type="text"
                        value={page.title}
                        onChange={(e) => patchLegalPage(slug, "title", e.target.value)}
                        maxLength={80}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Meta title">
                      <input
                        type="text"
                        value={page.metaTitle}
                        onChange={(e) => patchLegalPage(slug, "metaTitle", e.target.value)}
                        maxLength={80}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Meta description">
                    <textarea
                      value={page.metaDescription}
                      onChange={(e) => patchLegalPage(slug, "metaDescription", e.target.value)}
                      maxLength={200}
                      rows={2}
                      className={textareaCls}
                    />
                  </Field>
                  <Field label="Page content" hint="Plain text. Blank lines separate paragraphs. A short line followed by more text becomes a subheading.">
                    <textarea
                      value={page.body}
                      onChange={(e) => patchLegalPage(slug, "body", e.target.value)}
                      maxLength={6000}
                      rows={10}
                      className={textareaCls + " font-mono text-xs leading-relaxed"}
                    />
                    <p className="text-[11px] text-gray-400 mt-1 text-right tabular-nums">
                      {page.body.length} / 6,000 characters
                    </p>
                  </Field>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Footer */}
        <Section
          title="Footer"
          description="Tagline and copyright shown at the bottom of every storefront page."
        >
          <Field label="Tagline">
            <textarea
              value={site.footer.tagline}
              onChange={(e) => patchFooter("tagline", e.target.value)}
              maxLength={200}
              rows={2}
              className={textareaCls}
            />
          </Field>
          <Field label="Copyright">
            <input
              type="text"
              value={site.footer.copyright}
              onChange={(e) => patchFooter("copyright", e.target.value)}
              maxLength={120}
              className={inputCls}
            />
          </Field>
        </Section>
        </>
      )}

      {tab === "rayk" && (
        <>
        {/* RAYK Hero */}
        <Section
          title="RAYK Homepage Hero"
          description="The cinematic top section of /rayk. The wordmark and bracket frame stay fixed; everything else is editable."
        >
          <Field label="Kicker (small label above the wordmark)" hint='e.g. "CUSTOM 3D PRINTED"'>
            <input
              type="text"
              value={site.rayk.hero.kicker}
              onChange={(e) => patchRaykHero("kicker", e.target.value)}
              maxLength={60}
              className={inputCls}
            />
          </Field>
          <Field label="Title accent (gold highlighted)" hint='e.g. "LIGHTING FIXTURES"'>
            <input
              type="text"
              value={site.rayk.hero.titleAccent}
              onChange={(e) => patchRaykHero("titleAccent", e.target.value)}
              maxLength={60}
              className={inputCls}
            />
          </Field>
          <Field label="Subtitle">
            <textarea
              value={site.rayk.hero.subtitle}
              onChange={(e) => patchRaykHero("subtitle", e.target.value)}
              maxLength={240}
              rows={2}
              className={textareaCls}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="CTA button text">
              <input type="text" value={site.rayk.hero.ctaText} onChange={(e) => patchRaykHero("ctaText", e.target.value)} maxLength={40} className={inputCls} />
            </Field>
            <Field label="CTA button link">
              <input type="text" value={site.rayk.hero.ctaHref} onChange={(e) => patchRaykHero("ctaHref", e.target.value)} placeholder="/rayk/shop" className={inputCls} />
            </Field>
          </div>
          <ImageField
            label="Hero background image"
            hint="Large background image behind the lamp render."
            value={site.rayk.hero.backgroundImageUrl}
            alt={site.rayk.hero.backgroundImageAlt}
            onChange={(url) => patchRaykHero("backgroundImageUrl", url)}
            onAltChange={(alt) => patchRaykHero("backgroundImageAlt", alt)}
          />
        </Section>

        {/* RAYK 3 lighting fixtures (lamp1 / lamp2 / lamp3 around the hero) */}
        <Section
          title="RAYK Lighting Fixtures"
          description="The three lighting fixtures that float around the RAYK hero. Each is independently editable. Uncheck Published to remove a fixture without losing its content."
        >
          <div className="space-y-5">
            {site.rayk.lightingFixtures.map((f, i) => {
              const positionLabel = ["Left (small)", "Center (medium)", "Right (large)"][i] ?? `Fixture ${i + 1}`;
              return (
                <div key={i} className="border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                        Fixture {i + 1} — {positionLabel}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Shown over the RAYK hero background. Hover behavior and parallax stay fixed.
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={f.enabled}
                        onChange={(e) => patchRaykFixture(i, "enabled", e.target.checked)}
                        className="accent-indigo-600"
                      />
                      {f.enabled ? "Published" : "Hidden"}
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Title / name">
                      <input
                        type="text"
                        value={f.title}
                        onChange={(e) => patchRaykFixture(i, "title", e.target.value)}
                        maxLength={80}
                        placeholder="Pendant Glow"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Link href" hint="Optional. Leave blank to keep the fixture non-clickable.">
                      <input
                        type="text"
                        value={f.linkHref}
                        onChange={(e) => patchRaykFixture(i, "linkHref", e.target.value)}
                        maxLength={200}
                        placeholder="/rayk/category/lighting"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea
                      value={f.description}
                      onChange={(e) => patchRaykFixture(i, "description", e.target.value)}
                      maxLength={200}
                      rows={2}
                      className={textareaCls}
                    />
                  </Field>
                  <ImageField
                    label="Fixture image"
                    hint="Recommended: transparent PNG, tall portrait aspect."
                    value={f.imageUrl}
                    alt={f.imageAlt}
                    onChange={(url) => patchRaykFixture(i, "imageUrl", url)}
                    onAltChange={(alt) => patchRaykFixture(i, "imageAlt", alt)}
                  />
                </div>
              );
            })}
          </div>
        </Section>

        {/* RAYK Hero feature row (4 items along the bottom of the hero) */}
        <Section
          title="RAYK Hero Feature Row"
          description="Four small labels at the bottom of the RAYK hero (icons stay fixed; only text is editable)."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {site.rayk.heroFeatures.map((f, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Feature {i + 1}</p>
                <Field label="Label">
                  <input
                    type="text"
                    value={f.title}
                    onChange={(e) => patchRaykFeatureArr("heroFeatures", i, "title", e.target.value)}
                    maxLength={60}
                    className={inputCls}
                  />
                </Field>
              </div>
            ))}
          </div>
        </Section>

        {/* RAYK Benefits strip */}
        <Section
          title="RAYK Benefits Strip"
          description="Four cards in the white strip below the hero. Icons stay fixed; titles and subtitles are editable."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {site.rayk.benefits.map((b, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Benefit {i + 1}</p>
                <Field label="Title">
                  <input
                    type="text"
                    value={b.title}
                    onChange={(e) => patchRaykFeatureArr("benefits", i, "title", e.target.value)}
                    maxLength={60}
                    className={inputCls}
                  />
                </Field>
                <Field label="Subtitle">
                  <input
                    type="text"
                    value={b.subtitle}
                    onChange={(e) => patchRaykFeatureArr("benefits", i, "subtitle", e.target.value)}
                    maxLength={80}
                    className={inputCls}
                  />
                </Field>
              </div>
            ))}
          </div>
        </Section>

        {/* RAYK Bottom black strip */}
        <Section
          title="RAYK Bottom Feature Strip"
          description="Four items in the black strip near the bottom of /rayk."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {site.rayk.bottomFeatures.map((b, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Card {i + 1}</p>
                <Field label="Title">
                  <input
                    type="text"
                    value={b.title}
                    onChange={(e) => patchRaykFeatureArr("bottomFeatures", i, "title", e.target.value)}
                    maxLength={60}
                    className={inputCls}
                  />
                </Field>
                <Field label="Subtitle">
                  <input
                    type="text"
                    value={b.subtitle}
                    onChange={(e) => patchRaykFeatureArr("bottomFeatures", i, "subtitle", e.target.value)}
                    maxLength={80}
                    className={inputCls}
                  />
                </Field>
              </div>
            ))}
          </div>
        </Section>

        {/* RAYK Section titles */}
        <Section
          title="RAYK Section Titles"
          description="Headings used on the RAYK homepage."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Categories — eyebrow (optional)">
              <input
                type="text"
                value={site.rayk.sections.categoriesEyebrow}
                onChange={(e) => patchRaykSections("categoriesEyebrow", e.target.value)}
                maxLength={80}
                placeholder=""
                className={inputCls}
              />
            </Field>
            <Field label="Categories — title">
              <input
                type="text"
                value={site.rayk.sections.categoriesTitle}
                onChange={(e) => patchRaykSections("categoriesTitle", e.target.value)}
                maxLength={80}
                placeholder="Shop by Category"
                className={inputCls}
              />
            </Field>
            <Field label='Categories — "View All" text'>
              <input
                type="text"
                value={site.rayk.sections.categoriesViewAllText}
                onChange={(e) => patchRaykSections("categoriesViewAllText", e.target.value)}
                maxLength={40}
                placeholder="View All"
                className={inputCls}
              />
            </Field>
            <Field label="Testimonials — kicker">
              <input
                type="text"
                value={site.rayk.sections.testimonialsKicker}
                onChange={(e) => patchRaykSections("testimonialsKicker", e.target.value)}
                maxLength={80}
                placeholder="Loved by our customers"
                className={inputCls}
              />
            </Field>
            <Field label="Testimonials — title">
              <input
                type="text"
                value={site.rayk.sections.testimonialsTitle}
                onChange={(e) => patchRaykSections("testimonialsTitle", e.target.value)}
                maxLength={80}
                placeholder="What they say"
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        {/* RAYK Announcement (optional brand-only banner) */}
        <Section
          title="RAYK Announcement"
          description="Optional brand-specific banner shown above RAYK pages. Leave disabled to use the shared top bar announcement only."
        >
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={site.rayk.announcement.enabled}
              onChange={(e) => patchRaykAnnouncement("enabled", e.target.checked)}
              className="accent-indigo-600"
            />
            Show RAYK announcement
          </label>
          <Field label="Announcement text">
            <input
              type="text"
              value={site.rayk.announcement.text}
              onChange={(e) => patchRaykAnnouncement("text", e.target.value)}
              maxLength={200}
              placeholder=""
              className={inputCls}
            />
          </Field>
        </Section>

        {/* RAYK SEO */}
        <Section
          title="RAYK SEO"
          description="Meta title, description, and OG image for /rayk and child pages that don't set their own."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Meta title">
              <input
                type="text"
                value={site.rayk.seo.metaTitle}
                onChange={(e) => patchRaykSeo("metaTitle", e.target.value)}
                maxLength={120}
                className={inputCls}
              />
            </Field>
            <Field label="OG image URL">
              <input
                type="text"
                value={site.rayk.seo.ogImage}
                onChange={(e) => patchRaykSeo("ogImage", e.target.value)}
                placeholder="/rayk/hero.png  or  https://…"
                className={inputCls + " font-mono text-xs"}
              />
            </Field>
          </div>
          <Field label="Meta description">
            <textarea
              value={site.rayk.seo.metaDescription}
              onChange={(e) => patchRaykSeo("metaDescription", e.target.value)}
              maxLength={240}
              rows={2}
              className={textareaCls}
            />
          </Field>
        </Section>

        {/* RAYK Contact overrides */}
        <Section
          title="RAYK Contact Overrides"
          description="Per-RAYK contact details. Leave a field blank to inherit the General Settings value."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Phone (override)" hint="Leave empty to use general phone.">
              <input
                type="tel"
                value={site.rayk.contactOverrides.phone}
                onChange={(e) => patchRaykContactOverride("phone", e.target.value)}
                placeholder={site.contact.phone}
                className={inputCls}
              />
            </Field>
            <Field label="WhatsApp phone (override)" hint="Digits only; empty = general.">
              <input
                type="tel"
                value={site.rayk.contactOverrides.whatsappPhone}
                onChange={(e) => patchRaykContactOverride("whatsappPhone", e.target.value.replace(/[^0-9]/g, ""))}
                placeholder={site.contact.whatsappPhone}
                className={inputCls}
              />
            </Field>
            <Field label="Email (override)">
              <input
                type="email"
                value={site.rayk.contactOverrides.email}
                onChange={(e) => patchRaykContactOverride("email", e.target.value)}
                placeholder={site.contact.email}
                className={inputCls}
              />
            </Field>
            <Field label="Address (override)">
              <input
                type="text"
                value={site.rayk.contactOverrides.address}
                onChange={(e) => patchRaykContactOverride("address", e.target.value)}
                placeholder={site.contact.address}
                className={inputCls}
              />
            </Field>
            <Field label="Working hours (override)">
              <input
                type="text"
                value={site.rayk.contactOverrides.workingHours}
                onChange={(e) => patchRaykContactOverride("workingHours", e.target.value)}
                placeholder="Sunday – Thursday, 10:00 – 18:00"
                className={inputCls}
              />
            </Field>
            <Field label="Instagram URL (RAYK)">
              <input
                type="url"
                value={site.rayk.contactOverrides.instagramUrl}
                onChange={(e) => patchRaykContactOverride("instagramUrl", e.target.value)}
                placeholder="https://instagram.com/rayk.egy"
                className={inputCls}
              />
            </Field>
            <Field label="Instagram handle (RAYK)">
              <input
                type="text"
                value={site.rayk.contactOverrides.instagramHandle}
                onChange={(e) => patchRaykContactOverride("instagramHandle", e.target.value)}
                placeholder="@rayk.egy"
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        {/* RAYK Footer */}
        <Section
          title="RAYK Footer"
          description="Tagline and copyright shown at the bottom of /rayk pages."
        >
          <Field label="Tagline">
            <textarea
              value={site.rayk.footer.tagline}
              onChange={(e) => patchRaykFooter("tagline", e.target.value)}
              maxLength={200}
              rows={2}
              className={textareaCls}
            />
          </Field>
          <Field label="Copyright">
            <input
              type="text"
              value={site.rayk.footer.copyright}
              onChange={(e) => patchRaykFooter("copyright", e.target.value)}
              maxLength={120}
              className={inputCls}
            />
          </Field>
        </Section>

        {/* RAYK Contact Page */}
        <Section
          title="RAYK Contact Page (/rayk/contact)"
          description="Content shown on the public /rayk/contact page. Channels come from RAYK Contact Overrides (or General if blank)."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Page title">
              <input
                type="text"
                value={site.rayk.contactPage.title}
                onChange={(e) => patchRaykContactPage("title", e.target.value)}
                maxLength={80}
                className={inputCls}
              />
            </Field>
            <Field label="Meta title">
              <input
                type="text"
                value={site.rayk.contactPage.metaTitle}
                onChange={(e) => patchRaykContactPage("metaTitle", e.target.value)}
                maxLength={80}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Meta description">
            <textarea
              value={site.rayk.contactPage.metaDescription}
              onChange={(e) => patchRaykContactPage("metaDescription", e.target.value)}
              maxLength={200}
              rows={2}
              className={textareaCls}
            />
          </Field>
          <Field label="Intro paragraph">
            <textarea
              value={site.rayk.contactPage.intro}
              onChange={(e) => patchRaykContactPage("intro", e.target.value)}
              maxLength={1000}
              rows={3}
              className={textareaCls}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Working hours">
              <input
                type="text"
                value={site.rayk.contactPage.workingHours}
                onChange={(e) => patchRaykContactPage("workingHours", e.target.value)}
                maxLength={200}
                className={inputCls}
              />
            </Field>
            <Field label="Map embed URL" hint="Optional Google Maps embed URL.">
              <input
                type="url"
                value={site.rayk.contactPage.mapEmbedUrl}
                onChange={(e) => patchRaykContactPage("mapEmbedUrl", e.target.value)}
                maxLength={500}
                placeholder="https://www.google.com/maps/embed?…"
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        {/* RAYK Legal & Basic Pages */}
        <Section
          title="RAYK Legal & Basic Pages"
          description="Privacy policy, terms, refund policy, and shipping policy for /rayk. Each page has its own public RAYK-styled route at /rayk/<slug>. Content is plain text — blank lines separate paragraphs, and a short line followed by more text becomes a subheading."
        >
          <div className="space-y-5">
            {LEGAL_PAGE_SLUGS.map((slug) => {
              const page = site.rayk.legalPages[slug];
              const meta = raykLegalSlugLabels[slug];
              return (
                <div key={slug} className="border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">{meta.route}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{meta.description}</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={page.enabled}
                        onChange={(e) => patchRaykLegalPage(slug, "enabled", e.target.checked)}
                        className="accent-indigo-600"
                      />
                      {page.enabled ? "Published" : "Hidden"}
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Page title">
                      <input
                        type="text"
                        value={page.title}
                        onChange={(e) => patchRaykLegalPage(slug, "title", e.target.value)}
                        maxLength={80}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Meta title">
                      <input
                        type="text"
                        value={page.metaTitle}
                        onChange={(e) => patchRaykLegalPage(slug, "metaTitle", e.target.value)}
                        maxLength={80}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Meta description">
                    <textarea
                      value={page.metaDescription}
                      onChange={(e) => patchRaykLegalPage(slug, "metaDescription", e.target.value)}
                      maxLength={200}
                      rows={2}
                      className={textareaCls}
                    />
                  </Field>
                  <Field label="Page content" hint="Plain text. Blank lines separate paragraphs.">
                    <textarea
                      value={page.body}
                      onChange={(e) => patchRaykLegalPage(slug, "body", e.target.value)}
                      maxLength={5000}
                      rows={10}
                      className={textareaCls + " font-mono text-xs leading-relaxed"}
                    />
                    <p className="text-[11px] text-gray-400 mt-1 text-right tabular-nums">
                      {page.body.length} / 5,000 characters
                    </p>
                  </Field>
                </div>
              );
            })}
          </div>
        </Section>
        </>
      )}

        {/* Save bar */}
        <div className="sticky bottom-2 z-10 bg-white/95 backdrop-blur border border-gray-100 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-[0_8px_24px_-12px_rgba(17,24,39,0.18)]">
          <p className="text-xs text-gray-500 flex-1">
            Changes apply to the homepage and storefront chrome after saving. Defaults restore automatically for empty fields.
          </p>
          {siteMsg && (
            <p className={`text-xs anim-fade-slide-in rounded-lg px-3 py-1.5 border ${siteMsg.ok ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"}`}>
              {siteMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={siteSaving}
            className="bg-indigo-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors press shadow-sm shrink-0"
          >
            {siteSaving ? "Saving…" : "Save Homepage & Business Settings"}
          </button>
        </div>
      </form>

      {tab === "general" && (
      <Section title="Shipping Fee" description="Choose how shipping is presented to customers at checkout.">
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
            <p className={`text-xs rounded-lg px-3 py-2 border anim-fade-slide-in ${shippingMsg.ok ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"}`}>
              {shippingMsg.text}
            </p>
          )}

          <button type="submit" disabled={shippingSaving}
            className="bg-indigo-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors press">
            {shippingSaving ? "Saving..." : "Save Shipping Settings"}
          </button>
        </form>
      </Section>
      )}
    </div>
  );
}

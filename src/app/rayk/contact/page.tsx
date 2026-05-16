import type { Metadata } from "next";
import Link from "next/link";
import { readSiteSettings } from "@/lib/services/site-settings";
import { resolveRaykContact } from "@/lib/services/site-settings-types";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { rayk } = await readSiteSettings();
  return {
    title: rayk.contactPage.metaTitle,
    description: rayk.contactPage.metaDescription,
  };
}

export default async function RaykContactPage() {
  const settings = await readSiteSettings();
  const page = settings.rayk.contactPage;
  const c = resolveRaykContact(settings);

  const channels = [
    c.phone && {
      label: "Phone",
      value: c.phone,
      href: `tel:${c.phone.replace(/[^+0-9]/g, "")}`,
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.515l.7 2.8a2 2 0 01-.45 1.79L8.09 10.91a16 16 0 005 5l1.81-1.39a2 2 0 011.79-.45l2.8.7A2 2 0 0121 16.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      ),
    },
    c.whatsappPhone && {
      label: "WhatsApp",
      value: c.phone || `+${c.whatsappPhone}`,
      href: `https://wa.me/${c.whatsappPhone}`,
      external: true,
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M8 10h.01M12 10h.01M16 10h.01M21 12a8.96 8.96 0 01-1.5 5L21 22l-5-1.5A9 9 0 1121 12z" />
      ),
    },
    c.email && {
      label: "Email",
      value: c.email,
      href: `mailto:${c.email}`,
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      ),
    },
    c.instagramUrl && {
      label: "Instagram",
      value: c.instagramHandle || "Instagram",
      href: c.instagramUrl,
      external: true,
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M4 4h16v16H4zM4 4l16 16M20 4L4 20" />
      ),
    },
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    href: string;
    external?: boolean;
    icon: React.ReactNode;
  }>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16" style={{ background: "#F7F6F2" }}>
      <nav
        className="mb-6 flex items-center gap-2 text-[10px] font-semibold uppercase"
        style={{ color: "#A6A29A", letterSpacing: "0.3em" }}
      >
        <Link href="/rayk" className="hover:text-black transition-colors">RAYK</Link>
        <span>/</span>
        <span style={{ color: "#151515" }}>{page.title}</span>
      </nav>

      <header className="text-center mb-10">
        <p
          className="uppercase mb-3"
          style={{ color: "#77736D", fontSize: "10px", letterSpacing: "0.32em", fontWeight: 600 }}
        >
          RAYK
        </p>
        <h1
          className="font-bold tracking-tight"
          style={{ color: "#151515", fontSize: "clamp(24px, 2.6vw, 34px)", lineHeight: 1.2 }}
        >
          {page.title}
        </h1>
        {page.intro && (
          <p
            className="mt-4 max-w-xl mx-auto"
            style={{ color: "#3a3833", fontSize: "14px", lineHeight: 1.7 }}
          >
            {page.intro}
          </p>
        )}
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {channels.map((ch) => (
          <li key={ch.label}>
            <a
              href={ch.href}
              target={ch.external ? "_blank" : undefined}
              rel={ch.external ? "noopener noreferrer" : undefined}
              className="group flex items-center gap-4 bg-white border border-black/10 p-5 hover:border-black transition-colors"
            >
              <div
                className="w-11 h-11 flex items-center justify-center border border-black/10 shrink-0"
                style={{ background: "#F2F1ED" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="#151515" viewBox="0 0 24 24" aria-hidden="true">
                  {ch.icon}
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="uppercase"
                  style={{ color: "#77736D", fontSize: "10px", letterSpacing: "0.28em", fontWeight: 600 }}
                >
                  {ch.label}
                </p>
                <p
                  className="font-semibold truncate"
                  style={{ color: "#151515", fontSize: "14px", letterSpacing: "0.02em" }}
                >
                  {ch.value}
                </p>
              </div>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5 shrink-0"
                fill="none"
                stroke="#151515"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </li>
        ))}
      </ul>

      {(c.address || page.workingHours) && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {c.address && (
            <div className="bg-white border border-black/10 p-5">
              <p
                className="uppercase mb-2"
                style={{ color: "#77736D", fontSize: "10px", letterSpacing: "0.28em", fontWeight: 600 }}
              >
                Address
              </p>
              <p style={{ color: "#3a3833", fontSize: "14px", lineHeight: 1.7 }}>{c.address}</p>
            </div>
          )}
          {page.workingHours && (
            <div className="bg-white border border-black/10 p-5">
              <p
                className="uppercase mb-2"
                style={{ color: "#77736D", fontSize: "10px", letterSpacing: "0.28em", fontWeight: 600 }}
              >
                Working Hours
              </p>
              <p style={{ color: "#3a3833", fontSize: "14px", lineHeight: 1.7 }}>{page.workingHours}</p>
            </div>
          )}
        </div>
      )}

      {page.mapEmbedUrl && (
        <div className="mt-6 bg-white border border-black/10">
          <iframe
            src={page.mapEmbedUrl}
            title="Location map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full aspect-[16/9] border-0"
          />
        </div>
      )}
    </div>
  );
}

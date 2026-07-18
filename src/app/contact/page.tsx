import type { Metadata } from "next";
import Link from "next/link";
import { readSiteSettings } from "@/lib/services/site-settings";
import { absoluteUrl, jsonLdString, pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { contactPage } = await readSiteSettings();
  return pageMetadata({
    title: contactPage.metaTitle,
    description: contactPage.metaDescription,
    canonical: "/contact",
  });
}

export default async function ContactPage() {
  const settings = await readSiteSettings();
  const c = settings.contact;
  const page = settings.contactPage;

  // Only data already displayed publicly on this page goes into the schema.
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: page.metaTitle,
    description: page.metaDescription,
    url: absoluteUrl("/contact"),
    about: {
      "@type": "Organization",
      "@id": `${absoluteUrl("/")}#organization`,
      name: "3Dprintzone",
      url: absoluteUrl("/"),
      email: c.email,
      telephone: c.phone,
      address: c.address ? { "@type": "PostalAddress", streetAddress: c.address, addressCountry: "EG" } : undefined,
      sameAs: [c.instagramUrl].filter(Boolean),
    },
  };

  const channels = [
    c.phone && {
      label: "Phone",
      value: c.phone,
      href: `tel:${c.phone.replace(/[^+0-9]/g, "")}`,
      bg: "bg-indigo-50 text-indigo-600",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.515l.7 2.8a2 2 0 01-.45 1.79L8.09 10.91a16 16 0 005 5l1.81-1.39a2 2 0 011.79-.45l2.8.7A2 2 0 0121 16.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      ),
    },
    c.whatsappPhone && {
      label: "WhatsApp",
      value: c.phone || `+${c.whatsappPhone}`,
      href: `https://wa.me/${c.whatsappPhone}`,
      external: true,
      bg: "bg-green-50 text-green-600",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M21 12a8.96 8.96 0 01-1.5 5L21 22l-5-1.5A9 9 0 1121 12z" />
      ),
    },
    c.email && {
      label: "Email",
      value: c.email,
      href: `mailto:${c.email}`,
      bg: "bg-orange-50 text-orange-500",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      ),
    },
    c.instagramUrl && {
      label: "Instagram",
      value: c.instagramHandle || "Instagram",
      href: c.instagramUrl,
      external: true,
      bg: "bg-purple-50 text-purple-600",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h16v16H4zM4 4l16 16M20 4L4 20" />
      ),
    },
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    href: string;
    external?: boolean;
    bg: string;
    icon: React.ReactNode;
  }>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(contactJsonLd) }}
      />
      <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-600">{page.title}</span>
      </nav>

      <header className="text-center mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{page.title}</h1>
        {page.intro && (
          <p className="text-sm sm:text-base text-gray-500 mt-3 max-w-xl mx-auto leading-relaxed">
            {page.intro}
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {channels.map((ch) => (
          <a
            key={ch.label}
            href={ch.href}
            target={ch.external ? "_blank" : undefined}
            rel={ch.external ? "noopener noreferrer" : undefined}
            className="lift group flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:border-indigo-200 transition-colors"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${ch.bg}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {ch.icon}
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{ch.label}</p>
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                {ch.value}
              </p>
            </div>
            <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        ))}
      </div>

      {(c.address || page.workingHours) && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {c.address && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Address</p>
              <p className="text-sm text-gray-700 leading-relaxed">{c.address}</p>
            </div>
          )}
          {page.workingHours && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Working Hours</p>
              <p className="text-sm text-gray-700 leading-relaxed">{page.workingHours}</p>
            </div>
          )}
        </div>
      )}

      {page.mapEmbedUrl && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <iframe
            src={page.mapEmbedUrl}
            title="Location map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full aspect-[16/9] border-0"
          />
        </div>
      )}

      <div className="mt-10 bg-indigo-50 rounded-2xl border border-indigo-100 p-5 sm:p-6 text-center">
        <p className="text-sm text-indigo-700 font-semibold mb-2">Need something custom?</p>
        <p className="text-xs text-indigo-600/80 mb-4 max-w-md mx-auto">
          For architecture models, custom gifts, dental work, or mechanical parts.
        </p>
        <Link
          href="/custom-request"
          className="press inline-flex items-center gap-1.5 bg-indigo-600 text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-indigo-700 transition-colors"
        >
          Submit a Custom Request
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_SITE_SETTINGS } from "@/lib/services/site-settings-types";

/** Fallback matches the General contact default (+201012708316 → wa.me digits). */
const FALLBACK_WHATSAPP = DEFAULT_SITE_SETTINGS.contact.whatsappPhone;

/**
 * Floating WhatsApp contact button, fixed to the bottom-right of public pages.
 *
 * - Icon-only round button on mobile (won't cover content), pill with a
 *   "Contact Us" label on desktop.
 * - Resolves the WhatsApp number from admin-editable site settings, using the
 *   RAYK override on /rayk/* pages and falling back to the General contact,
 *   then to +201012708316 if settings are unavailable.
 * - Hidden on admin pages (including /admin/login).
 */
export default function FloatingContactButton() {
  const pathname = usePathname();
  const isRayk = pathname.startsWith("/rayk");
  const [whatsapp, setWhatsapp] = useState(FALLBACK_WHATSAPP);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/storefront/site-settings")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d?.success || !d.data) return;
        const general = d.data.contact?.whatsappPhone as string | undefined;
        const raykOverride = d.data.rayk?.contactOverrides?.whatsappPhone as string | undefined;
        const resolved = (isRayk && raykOverride?.trim() ? raykOverride : general) ?? "";
        if (resolved.trim()) setWhatsapp(resolved);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isRayk]);

  // Never show on admin (dashboard or login).
  if (pathname.startsWith("/admin")) return null;

  const digits = whatsapp.replace(/[^0-9]/g, "") || FALLBACK_WHATSAPP;
  const href = `https://wa.me/${digits}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      className="group fixed z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg shadow-black/20 ring-1 ring-black/5 transition-all duration-200 hover:bg-[#1ebe5b] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#25D366] active:scale-95"
      style={{
        right: "max(1rem, env(safe-area-inset-right))",
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <svg
        className="h-6 w-6 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      <span className="hidden text-sm font-semibold sm:inline">Contact Us</span>
    </a>
  );
}

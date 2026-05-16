"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DEFAULT_SITE_SETTINGS, type RaykSettings } from "@/lib/services/site-settings-types";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  iconKey?: string | null;
  description?: string | null;
  _count?: { products: number };
}

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  body: string | null;
  createdAt: string;
  product: { id: string; name: string; slug: string };
}

function TestimonialStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i <= rating ? "text-black" : "text-black/15"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function CategoryFallbackIcon({ iconKey, className = "w-10 h-10" }: { iconKey?: string | null; className?: string }) {
  const stroke = "#151515";
  const common = {
    fill: "none" as const,
    stroke,
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  // Always-safe default: a clean pendant-lamp glyph.
  if (!iconKey || iconKey === "cube" || iconKey === "default") {
    return (
      <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
        <line {...common} x1="24" y1="4" x2="24" y2="14" />
        <path {...common} d="M14 22c0-5.5 4.5-9 10-9s10 3.5 10 9c0 6-4.5 12-10 12s-10-6-10-12z" />
        <line {...common} x1="20" y1="36" x2="28" y2="36" />
      </svg>
    );
  }
  switch (iconKey) {
    case "mug":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M9 3H5v16h10V3H9zm0 0v16M15 8h2a2 2 0 010 4h-2" />
        </svg>
      );
    case "gear":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <circle {...common} cx="12" cy="12" r="3" />
          <path {...common} d="M19 12a7 7 0 00-.13-1.36l2.05-1.6-2-3.46-2.4.94a7 7 0 00-2.36-1.37L13.7 2.5h-3.4l-.46 2.65a7 7 0 00-2.36 1.37l-2.4-.94-2 3.46 2.05 1.6A7 7 0 005 12a7 7 0 00.13 1.36l-2.05 1.6 2 3.46 2.4-.94a7 7 0 002.36 1.37l.46 2.65h3.4l.46-2.65a7 7 0 002.36-1.37l2.4.94 2-3.46-2.05-1.6A7 7 0 0019 12z" />
        </svg>
      );
    case "phone":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <rect {...common} x="7" y="3" width="10" height="18" rx="2" />
          <line {...common} x1="11" y1="18" x2="13" y2="18" />
        </svg>
      );
    case "gift":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M3 12h18M5 12v8h14v-8M12 8v13M12 8a3 3 0 110-6 3 3 0 010 6zm0 0a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
      );
    case "home":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M3 12l9-8 9 8M5 10v10h14V10" />
        </svg>
      );
    case "printer":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6z" />
        </svg>
      );
    case "star":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6L12 16.8 6.6 19.6l1-6L3.3 9.4l6-.9z" />
        </svg>
      );
    case "wrench":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M14.7 6.3a4.5 4.5 0 015.5 5.5l-9.7 9.7a2 2 0 01-2.8-2.8l9.7-9.7zM4 4l5 5" />
        </svg>
      );
    case "box":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10" />
        </svg>
      );
    case "sculpture":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <circle {...common} cx="12" cy="8" r="4" />
          <path {...common} d="M5 21a7 7 0 0114 0H5z" />
        </svg>
      );
    case "dots":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="5" cy="12" r="1.4" fill={stroke} />
          <circle cx="12" cy="12" r="1.4" fill={stroke} />
          <circle cx="19" cy="12" r="1.4" fill={stroke} />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
          <line {...common} x1="24" y1="4" x2="24" y2="14" />
          <path {...common} d="M14 22c0-5.5 4.5-9 10-9s10 3.5 10 9c0 6-4.5 12-10 12s-10-6-10-12z" />
          <line {...common} x1="20" y1="36" x2="28" y2="36" />
        </svg>
      );
  }
}

const HERO_FEATURES: { label: string; icon: React.ReactNode }[] = [
  {
    label: "3D PRINTED\nWITH PRECISION",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l8 4v10l-8 4-8-4V7l8-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7l8 4 8-4M12 11v10" />
      </svg>
    ),
  },
  {
    label: "CUSTOM COLORS\n& FINISHES",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3a9 9 0 100 18c1.5 0 2.5-1 2.5-2.3 0-1.4-1-2.2-1-3.2 0-1 .8-1.5 1.7-1.5H17a4 4 0 004-4 9 9 0 00-9-7z" />
        <circle cx="7.5" cy="11" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="9.5" cy="7" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="14" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="9.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "DURABLE &\nLIGHTWEIGHT",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l8 3v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-3z" />
      </svg>
    ),
  },
  {
    label: "SECURE PACKAGING\n& FAST SHIPPING",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h11v9H3zM14 11h4l3 3v2h-7" />
        <circle cx="7.5" cy="17.5" r="1.5" fill="none" stroke="currentColor" strokeWidth={1.5} />
        <circle cx="17.5" cy="17.5" r="1.5" fill="none" stroke="currentColor" strokeWidth={1.5} />
      </svg>
    ),
  },
];

const BENEFITS: { title: string; subtitle: string; icon: React.ReactNode }[] = [
  {
    title: "Fast Delivery",
    subtitle: "Across Egypt",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h11v9H3zM14 11h4l3 3v2h-7" />
        <circle cx="7.5" cy="17.5" r="1.5" stroke="currentColor" strokeWidth={1.5} fill="none" />
        <circle cx="17.5" cy="17.5" r="1.5" stroke="currentColor" strokeWidth={1.5} fill="none" />
      </svg>
    ),
  },
  {
    title: "Quality Guaranteed",
    subtitle: "Precision printing",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l8 3v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Easy Payment",
    subtitle: "COD & InstaPay",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth={1.5} fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h4" />
      </svg>
    ),
  },
  {
    title: "Custom Designs",
    subtitle: "Any size or shape",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.7 6.3l3 3-9 9H5.7v-3l9-9zM13 8l3 3" />
      </svg>
    ),
  },
];

const BOTTOM_FEATURES: { title: string; subtitle: string; icon: React.ReactNode }[] = [
  {
    title: "MODERN DESIGNS",
    subtitle: "Minimal, elegant & timeless.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M5.6 18.4l4.2-4.2M14.2 9.8l4.2-4.2" />
      </svg>
    ),
  },
  {
    title: "CUSTOM MADE",
    subtitle: "Tailored to your style.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M12 3l8 4v10l-8 4-8-4V7l8-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M4 7l8 4 8-4M12 11v10" />
      </svg>
    ),
  },
  {
    title: "PREMIUM QUALITY",
    subtitle: "Built to last.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <circle cx="12" cy="9" r="5" stroke="currentColor" strokeWidth={1.4} fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M8.5 13.2L7 21l5-3 5 3-1.5-7.8" />
      </svg>
    ),
  },
  {
    title: "MADE LOCALLY",
    subtitle: "Proudly 3D printed in Egypt.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M12 22s7-7.6 7-13a7 7 0 10-14 0c0 5.4 7 13 7 13z" />
        <circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth={1.4} fill="none" />
      </svg>
    ),
  },
];

const PAGE_STYLES = `
  /* ============================ HERO HEIGHTS ============================ */
  /* Mobile first: keep current good mobile composition */
  .rayk-hero { height: 760px; }
  @media (min-width: 480px) { .rayk-hero { height: 740px; } }
  @media (min-width: 640px) { .rayk-hero { height: 720px; } }
  @media (min-width: 768px) { .rayk-hero { height: 620px; } }
  @media (min-width: 1024px) { .rayk-hero { height: 520px; } }
  @media (min-width: 1280px) { .rayk-hero { height: 560px; } }
  @media (min-width: 1536px) { .rayk-hero { height: 580px; } }

  /* ============================ HERO TEXT ============================ */
  /* Mobile: in-flow, top padding so text sits below the lamp cluster */
  .rayk-hero-text {
    position: relative;
    z-index: 10;
    padding: 88px 20px 0 20px;
    max-width: 460px;
    margin: 0 auto 0 0;
  }
  @media (min-width: 640px) {
    .rayk-hero-text { padding: 96px 28px 0 28px; }
  }
  /* Tablet+: switch to absolute centered-left positioning to avoid clipping */
  @media (min-width: 768px) {
    .rayk-hero-text {
      position: absolute;
      top: 50%;
      left: max(5vw, 48px);
      transform: translateY(-50%);
      padding: 0;
      max-width: 380px;
    }
  }
  @media (min-width: 1024px) {
    .rayk-hero-text {
      left: max(6vw, 96px);
      max-width: 420px;
      transform: translateY(-52%);
    }
  }
  @media (min-width: 1280px) {
    .rayk-hero-text {
      left: max(7vw, 110px);
      max-width: 440px;
    }
  }

  /* ============================ HERO LAMPS ============================ */
  .rayk-lamp { transition: transform 200ms ease-out; will-change: transform; }
  /* Default (desktop) lamp positions */
  .rayk-lamp-left  { top: 0px;  left: clamp(47%, 49vw, 51%); width: clamp(150px, 13vw, 230px); }
  .rayk-lamp-mid   { top: 0px;  left: clamp(57%, 60vw, 62%); width: clamp(190px, 17vw, 300px); }
  .rayk-lamp-right { top: -4px; left: clamp(69%, 72vw, 74%); width: clamp(260px, 24vw, 410px); }

  /* Tablet tweaks */
  @media (max-width: 1023px) and (min-width: 768px) {
    .rayk-lamp-left  { left: 52% !important; width: clamp(140px, 17vw, 200px) !important; }
    .rayk-lamp-mid   { left: 62% !important; width: clamp(170px, 21vw, 250px) !important; }
    .rayk-lamp-right { left: 74% !important; width: clamp(220px, 28vw, 320px) !important; }
  }

  /* Mobile: keep the cluster grouped/visible without crowding text */
  @media (max-width: 767px) {
    .rayk-lamp-left  { left: 30% !important; top: 8px !important; width: clamp(110px, 30vw, 170px) !important; }
    .rayk-lamp-mid   { left: 48% !important; top: 4px !important; width: clamp(140px, 38vw, 210px) !important; }
    .rayk-lamp-right { left: 64% !important; top: 6px !important; width: clamp(170px, 46vw, 250px) !important; }
  }

  /* ====================== HERO BOTTOM FEATURE ROW ====================== */
  .rayk-hero-features {
    position: absolute;
    left: 0; right: 0;
    bottom: 18px;
    z-index: 10;
  }
  @media (min-width: 768px) { .rayk-hero-features { bottom: 24px; } }
  @media (min-width: 1024px) { .rayk-hero-features { bottom: 30px; } }

  /* ====================== BENEFIT STRIP DIVIDERS ====================== */
  .rayk-benefits-list > li { border-right: 0; }
  @media (min-width: 768px) {
    .rayk-benefits-list > li:not(:last-child) { border-right: 1px solid #E5E1D8; }
  }
  @media (min-width: 480px) and (max-width: 767px) {
    .rayk-benefits-list > li:nth-child(odd) { border-right: 1px solid #E5E1D8; }
  }

  /* ====================== BOTTOM BLACK STRIP DIVIDERS ====================== */
  .rayk-bottom-list > li { border-right: 0; }
  @media (min-width: 768px) {
    .rayk-bottom-list > li:not(:last-child) {
      border-right: 1px solid rgba(255,255,255,0.12);
    }
  }
  @media (min-width: 480px) and (max-width: 767px) {
    .rayk-bottom-list > li:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.12); }
    .rayk-bottom-list > li:nth-child(1),
    .rayk-bottom-list > li:nth-child(2) { border-bottom: 1px solid rgba(255,255,255,0.12); }
  }

  /* ====================== CATEGORY CARD HOVER ====================== */
  .rayk-cat-card { will-change: transform; transition: transform 250ms ease, box-shadow 250ms ease; }
  .rayk-cat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px -16px rgba(0,0,0,0.18); }
  .rayk-cat-card:hover .rayk-cat-img { transform: scale(1.03); }
  .rayk-cat-img { transition: transform 250ms ease; }

  /* ====================== CTA HOVER ====================== */
  .rayk-cta { transition: background-color 250ms ease, color 250ms ease; }
  .rayk-cta:hover { background-color: #D5B98C !important; color: #050505 !important; }
`;

export default function RaykHomePageClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [rayk, setRayk] = useState<RaykSettings>(DEFAULT_SITE_SETTINGS.rayk);
  const lampLeftRef = useRef<HTMLDivElement>(null);
  const lampMidRef = useRef<HTMLDivElement>(null);
  const lampRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/storefront/categories?brand=rayk", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d?.data) ? d.data : []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));

    fetch("/api/storefront/reviews?brand=rayk&limit=6", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setTestimonials(Array.isArray(d?.data) ? d.data : []))
      .catch(() => setTestimonials([]))
      .finally(() => setTestimonialsLoading(false));

    fetch("/api/storefront/site-settings", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data?.rayk) setRayk(d.data.rayk); })
      .catch(() => {});
  }, []);

  // Scroll-based lamp animation (respects prefers-reduced-motion).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let raf = 0;
    const RANGE = 600;

    function update() {
      raf = 0;
      const y = Math.min(Math.max(window.scrollY, 0), RANGE);
      const p = y / RANGE;
      if (lampLeftRef.current) {
        lampLeftRef.current.style.transform =
          `translate3d(${(p * -16).toFixed(2)}px, ${(p * 38).toFixed(2)}px, 0) rotate(${(p * -2).toFixed(3)}deg)`;
      }
      if (lampMidRef.current) {
        lampMidRef.current.style.transform =
          `translate3d(0px, ${(p * 50).toFixed(2)}px, 0) scale(${(1 + p * 0.025).toFixed(4)}) rotate(${(p * 1.5).toFixed(3)}deg)`;
      }
      if (lampRightRef.current) {
        lampRightRef.current.style.transform =
          `translate3d(${(p * 18).toFixed(2)}px, ${(p * 35).toFixed(2)}px, 0) rotate(${(p * 2).toFixed(3)}deg)`;
      }
    }

    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const visibleCategories = categories.slice(0, 6);

  return (
    <div style={{ background: "#F7F6F2", color: "#151515" }}>
      <style>{PAGE_STYLES}</style>

      {/* ============================== HERO ============================== */}
      <section className="rayk-hero relative w-full overflow-hidden" style={{ background: "#070706" }}>
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={rayk.hero.backgroundImageUrl || "/rayk/hero.png"}
            alt={rayk.hero.backgroundImageAlt || "RAYK ambient interior"}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "right center" }}
          />
          {/* Cinematic dark overlay */}
          <div className="absolute inset-0" style={{ background: "rgba(0, 0, 0, 0.55)" }} />
          {/* Left readability gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.72) 24%, rgba(0,0,0,0.28) 54%, rgba(0,0,0,0.05) 100%)",
            }}
          />
          {/* Mobile extra darkening for text readability */}
          <div
            className="absolute inset-0 md:hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.28) 45%, rgba(0,0,0,0.55) 100%)",
            }}
          />
        </div>

        {/* Lamps — each one is editable from /admin/settings → RAYK tab.
            Disabled fixtures fall back to the bundled default image so the
            hero composition never collapses. */}
        <div className="absolute inset-0 pointer-events-none">
          {(() => {
            const fixtures = rayk.lightingFixtures;
            const fallback = ["/rayk/lamp1.png", "/rayk/lamp2.png", "/rayk/lamp3.png"];
            const lampRefs = [lampLeftRef, lampMidRef, lampRightRef] as const;
            const lampClasses = ["rayk-lamp-left", "rayk-lamp-mid", "rayk-lamp-right"] as const;
            const lampSizes = [
              "(max-width: 767px) 30vw, (max-width: 1024px) 17vw, 230px",
              "(max-width: 767px) 38vw, (max-width: 1024px) 21vw, 300px",
              "(max-width: 767px) 46vw, (max-width: 1024px) 28vw, 410px",
            ];
            const lampFilters = [
              "drop-shadow(0 12px 24px rgba(0,0,0,0.55))",
              "drop-shadow(0 18px 30px rgba(0,0,0,0.55)) drop-shadow(0 0 30px rgba(242, 184, 101, 0.16))",
              "drop-shadow(0 22px 36px rgba(0,0,0,0.6)) drop-shadow(0 0 50px rgba(242, 184, 101, 0.18))",
            ];
            return [0, 1, 2].map((i) => {
              const f = fixtures[i];
              if (!f.enabled) return null;
              const src = f.imageUrl || fallback[i];
              const alt = f.imageAlt || f.title || "";
              return (
                <div
                  key={i}
                  ref={lampRefs[i]}
                  className={`absolute rayk-lamp ${lampClasses[i]}`}
                  style={{
                    aspectRatio: "1024 / 1536",
                    transformOrigin: "top center",
                    filter: lampFilters[i],
                  }}
                >
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes={lampSizes[i]}
                    className="object-contain"
                    priority
                  />
                </div>
              );
            });
          })()}
        </div>

        {/* Hero text block */}
        <div className="rayk-hero-text">
          {/* RAYK logo with corner brackets */}
          <div className="relative inline-block">
            <span
              className="block leading-none font-light"
              style={{
                fontSize: "clamp(42px, 7.2vw, 76px)",
                letterSpacing: "0.32em",
                color: "#F8F7F2",
                textShadow: "0 2px 24px rgba(0,0,0,0.35)",
              }}
            >
              RAYK
            </span>
            <span
              aria-hidden="true"
              className="absolute -top-3 -left-3"
              style={{
                width: "14px",
                height: "14px",
                borderTop: "1px solid rgba(213,185,140,0.7)",
                borderLeft: "1px solid rgba(213,185,140,0.7)",
              }}
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-3 -right-3"
              style={{
                width: "14px",
                height: "14px",
                borderBottom: "1px solid rgba(213,185,140,0.7)",
                borderRight: "1px solid rgba(213,185,140,0.7)",
              }}
            />
          </div>

          <p
            className="mt-7 sm:mt-8 uppercase whitespace-nowrap"
            style={{
              color: "#F8F7F2",
              fontSize: "clamp(12px, 0.95vw, 15px)",
              letterSpacing: "0.32em",
              opacity: 0.85,
            }}
          >
            {rayk.hero.kicker}
          </p>
          <h1
            className="mt-2 uppercase whitespace-nowrap"
            style={{
              color: "#D5B98C",
              fontSize: "clamp(22px, 2.1vw, 32px)",
              letterSpacing: "0.26em",
              fontWeight: 400,
              lineHeight: 1.15,
            }}
          >
            {rayk.hero.titleAccent}
          </h1>
          <p
            className="mt-5 max-w-[340px]"
            style={{
              color: "#F8F7F2",
              fontSize: "clamp(14px, 1vw, 16px)",
              lineHeight: 1.7,
              opacity: 0.78,
            }}
          >
            {rayk.hero.subtitle}
          </p>

          <Link
            href={rayk.hero.ctaHref || "/rayk/shop"}
            className="rayk-cta group mt-7 inline-flex items-center justify-center gap-3 uppercase"
            style={{
              color: "#F8F7F2",
              border: "1px solid #B99E78",
              letterSpacing: "0.22em",
              fontSize: "12px",
              fontWeight: 500,
              padding: "14px 28px",
              minWidth: "170px",
              height: "48px",
              background: "transparent",
            }}
          >
            {rayk.hero.ctaText || "Shop Now"}
            <svg
              className="transition-transform duration-300 group-hover:translate-x-1"
              width="16"
              height="10"
              viewBox="0 0 16 10"
              fill="none"
              aria-hidden="true"
            >
              <path d="M1 5h13M10 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Hero bottom feature row */}
        <div className="rayk-hero-features">
          <div className="mx-auto px-5 sm:px-8 lg:px-[110px] xl:px-[130px]" style={{ maxWidth: "1440px" }}>
            <div className="grid grid-cols-2 md:flex md:flex-row md:flex-wrap items-start gap-x-6 gap-y-3 md:gap-x-10 lg:gap-x-[48px] xl:gap-x-[60px]">
              {HERO_FEATURES.map((f, i) => {
                const override = rayk.heroFeatures[i]?.title?.trim();
                return (
                  <div key={i} className="flex items-center gap-3 min-w-0">
                    <span style={{ color: "#D5B98C" }} className="shrink-0">
                      {f.icon}
                    </span>
                    <p
                      className="uppercase whitespace-pre-line"
                      style={{
                        color: "#F8F7F2",
                        fontSize: "clamp(10px, 0.72vw, 11px)",
                        letterSpacing: "0.2em",
                        lineHeight: 1.5,
                        fontWeight: 500,
                        opacity: 0.92,
                      }}
                    >
                      {override || f.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========================== WHITE BENEFIT STRIP =========================== */}
      <section style={{ background: "#F7F6F2" }}>
        <div className="mx-auto px-5 sm:px-8 lg:px-12" style={{ maxWidth: "1240px" }}>
          <ul
            className="rayk-benefits-list grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-4"
            style={{
              borderTop: "1px solid #E5E1D8",
              borderBottom: "1px solid #E5E1D8",
            }}
          >
            {BENEFITS.map((b, i) => {
              const titleOverride = rayk.benefits[i]?.title?.trim();
              const subtitleOverride = rayk.benefits[i]?.subtitle?.trim();
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 sm:py-5"
                >
                  <span style={{ color: "#151515" }} className="shrink-0">
                    {b.icon}
                  </span>
                  <div className="min-w-0">
                    <p
                      style={{
                        color: "#151515",
                        fontWeight: 600,
                        fontSize: "clamp(13px, 0.95vw, 15px)",
                        lineHeight: 1.2,
                      }}
                    >
                      {titleOverride || b.title}
                    </p>
                    <p
                      className="mt-0.5"
                      style={{
                        color: "#77736D",
                        fontSize: "clamp(12px, 0.85vw, 13px)",
                        lineHeight: 1.4,
                      }}
                    >
                      {subtitleOverride || b.subtitle}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ============================= SHOP BY CATEGORY ============================= */}
      <section style={{ background: "#F7F6F2" }} className="pt-7 sm:pt-[34px] pb-8 sm:pb-[42px]">
        <div className="mx-auto px-5 sm:px-8 lg:px-12" style={{ maxWidth: "1240px" }}>
          <div className="flex items-center justify-between mb-5 sm:mb-7">
            <h2
              className="uppercase"
              style={{
                color: "#151515",
                fontSize: "13px",
                letterSpacing: "0.28em",
                fontWeight: 700,
              }}
            >
              {rayk.sections.categoriesTitle || "Shop by Category"}
            </h2>
            <Link
              href="/rayk/shop"
              className="inline-flex items-center gap-2 uppercase hover:opacity-70 transition-opacity"
              style={{
                color: "#151515",
                fontSize: "12px",
                letterSpacing: "0.25em",
                fontWeight: 500,
              }}
            >
              {rayk.sections.categoriesViewAllText || "View All"}
              <svg width="14" height="9" viewBox="0 0 14 9" fill="none" aria-hidden="true">
                <path d="M1 4.5h11M9 1l3 3.5L9 8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{
                    background: "#F2F1ED",
                    border: "1px solid rgba(0,0,0,0.03)",
                    borderRadius: "8px",
                    height: "160px",
                  }}
                />
              ))}
            </div>
          ) : visibleCategories.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center text-center px-6 py-12 sm:py-16"
              style={{
                background: "#F2F1ED",
                border: "1px solid rgba(0,0,0,0.04)",
                borderRadius: "8px",
              }}
            >
              <span style={{ color: "#77736D" }} className="mb-3">
                <CategoryFallbackIcon iconKey="default" className="w-9 h-9" />
              </span>
              <p
                className="uppercase"
                style={{
                  color: "#151515",
                  fontSize: "12px",
                  letterSpacing: "0.28em",
                  fontWeight: 600,
                }}
              >
                No RAYK categories yet
              </p>
              <p
                className="mt-1.5"
                style={{ color: "#77736D", fontSize: "13px", lineHeight: 1.5 }}
              >
                Categories created in the admin panel will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {visibleCategories.map((cat) => {
                const count = cat._count?.products ?? 0;
                const subtitle = count > 0 ? `${count} ${count === 1 ? "product" : "products"}` : "";
                return (
                  <Link
                    key={cat.id}
                    href={`/rayk/category/${cat.slug}`}
                    className="rayk-cat-card group flex flex-col items-center justify-between p-4"
                    style={{
                      background: "#F2F1ED",
                      border: "1px solid rgba(0,0,0,0.03)",
                      borderRadius: "8px",
                      minHeight: "160px",
                    }}
                  >
                    <div
                      className="w-full flex items-center justify-center"
                      style={{ height: "82px" }}
                    >
                      {cat.imageUrl ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={cat.imageUrl}
                            alt={cat.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                            className="object-contain rayk-cat-img"
                          />
                        </div>
                      ) : (
                        <span className="text-[#151515]/80 rayk-cat-img inline-flex">
                          <CategoryFallbackIcon iconKey={cat.iconKey} className="w-10 h-10" />
                        </span>
                      )}
                    </div>
                    <div className="text-center mt-3">
                      <p
                        className="uppercase line-clamp-2"
                        style={{
                          color: "#151515",
                          fontSize: "12px",
                          letterSpacing: "0.18em",
                          fontWeight: 600,
                          lineHeight: 1.3,
                        }}
                      >
                        {cat.name}
                      </p>
                      {subtitle && (
                        <p
                          className="mt-1"
                          style={{ color: "#77736D", fontSize: "12px", letterSpacing: "0.04em" }}
                        >
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ============================= TESTIMONIALS ============================= */}
      {(testimonialsLoading || testimonials.length > 0) && (
        <section
          style={{ background: "#F7F6F2" }}
          className="pt-6 sm:pt-8 pb-10 sm:pb-14"
        >
          <div className="mx-auto px-5 sm:px-8 lg:px-12" style={{ maxWidth: "1240px" }}>
            <div className="flex items-end justify-between gap-4 mb-5 sm:mb-7 flex-wrap">
              <div>
                <p
                  className="uppercase mb-1"
                  style={{
                    color: "#77736D",
                    fontSize: "11px",
                    letterSpacing: "0.3em",
                    fontWeight: 600,
                  }}
                >
                  {rayk.sections.testimonialsKicker || "Loved by our customers"}
                </p>
                <h2
                  className="uppercase"
                  style={{
                    color: "#151515",
                    fontSize: "clamp(15px, 1.4vw, 18px)",
                    letterSpacing: "0.28em",
                    fontWeight: 700,
                  }}
                >
                  {rayk.sections.testimonialsTitle || "What they say"}
                </h2>
              </div>
            </div>

            {testimonialsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse"
                    style={{
                      background: "#F2F1ED",
                      border: "1px solid rgba(0,0,0,0.04)",
                      borderRadius: "10px",
                      height: "200px",
                    }}
                  />
                ))}
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {testimonials.slice(0, 6).map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-col p-5 sm:p-6"
                    style={{
                      background: "#F2F1ED",
                      border: "1px solid rgba(0,0,0,0.04)",
                      borderRadius: "10px",
                      minHeight: "200px",
                    }}
                  >
                    <TestimonialStars rating={t.rating} />
                    {t.body ? (
                      <p
                        className="mt-3 line-clamp-5 grow"
                        style={{
                          color: "#3a3833",
                          fontSize: "14px",
                          lineHeight: 1.6,
                          letterSpacing: "0.01em",
                        }}
                      >
                        &ldquo;{t.body}&rdquo;
                      </p>
                    ) : (
                      <p
                        className="mt-3 grow"
                        style={{ color: "#77736D", fontSize: "13px", fontStyle: "italic" }}
                      >
                        Loved their purchase.
                      </p>
                    )}
                    <div
                      className="mt-4 pt-4 flex items-center justify-between gap-3"
                      style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                    >
                      <div className="min-w-0">
                        <p
                          className="uppercase truncate"
                          style={{
                            color: "#151515",
                            fontSize: "12px",
                            letterSpacing: "0.16em",
                            fontWeight: 700,
                          }}
                        >
                          {t.name}
                        </p>
                        <Link
                          href={`/rayk/product/${t.product.slug}`}
                          className="block truncate hover:underline transition-colors"
                          style={{
                            color: "#77736D",
                            fontSize: "11px",
                            letterSpacing: "0.06em",
                            marginTop: "2px",
                          }}
                        >
                          {t.product.name}
                        </Link>
                      </div>
                      <span
                        className="uppercase shrink-0"
                        style={{
                          color: "#A6A29A",
                          fontSize: "10px",
                          letterSpacing: "0.18em",
                        }}
                      >
                        {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* ========================== BOTTOM BLACK FEATURE STRIP ========================= */}
      <section style={{ background: "#050505" }}>
        <div className="mx-auto px-5 sm:px-8 lg:px-12" style={{ maxWidth: "1240px" }}>
          <ul className="rayk-bottom-list grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-4">
            {BOTTOM_FEATURES.map((f, i) => {
              const titleOverride = rayk.bottomFeatures[i]?.title?.trim();
              const subtitleOverride = rayk.bottomFeatures[i]?.subtitle?.trim();
              return (
                <li
                  key={i}
                  className="flex items-center gap-4 px-4 sm:px-6 py-6 md:py-8"
                >
                  <span style={{ color: "#D5B98C" }} className="shrink-0">
                    {f.icon}
                  </span>
                  <div className="min-w-0">
                    <p
                      className="uppercase"
                      style={{
                        color: "#F8F7F2",
                        fontSize: "12px",
                        letterSpacing: "0.22em",
                        fontWeight: 600,
                        lineHeight: 1.3,
                      }}
                    >
                      {titleOverride || f.title}
                    </p>
                    <p
                      className="mt-1"
                      style={{
                        color: "#D5D0C7",
                        fontSize: "12px",
                        lineHeight: 1.45,
                        opacity: 0.8,
                      }}
                    >
                      {subtitleOverride || f.subtitle}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}

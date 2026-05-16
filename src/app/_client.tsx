"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ui/ProductCard";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/services/site-settings-types";

interface Category {
  id: string;
  name: string;
  slug: string;
  iconKey?: string | null;
  description?: string | null;
  _count?: { products: number };
}
interface Product {
  id: string; name: string; slug: string; shortDescription?: string | null;
  price: number; compareAtPrice?: number | null; stockQty: number;
  productType: string; isFeatured?: boolean;
  category?: { name: string; slug: string } | null;
  images?: { imageUrl: string; altText?: string | null }[];
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-gray-100 rounded-full w-1/3" />
        <div className="h-4 bg-gray-100 rounded-full w-4/5" />
        <div className="h-3 bg-gray-100 rounded-full w-2/3" />
        <div className="h-9 bg-gray-100 rounded-xl mt-3" />
      </div>
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl mx-auto mb-3" />
      <div className="h-3.5 bg-gray-100 rounded-full w-3/4 mx-auto" />
      <div className="h-2.5 bg-gray-100 rounded-full w-1/2 mx-auto mt-1.5" />
    </div>
  );
}

interface FloatingCardProps {
  img: string;
  label: string;
  sub: string;
  className?: string;
}

function FloatingCard({ img, label, sub, className = "" }: FloatingCardProps) {
  return (
    <div
      className={`flex flex-col bg-white/20 backdrop-blur-2xl border border-white/35 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.42)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-[transform,box-shadow] duration-300 ${className}`}
    >
      {/* Image — no padding so product fills the full image area */}
      <div className="relative flex-1 min-h-0 bg-black/10">
        <Image src={img} alt={label} fill className="object-contain" sizes="175px" />
      </div>
      {/* Text footer */}
      <div className="flex-shrink-0 px-2.5 py-1.5 bg-black/30 backdrop-blur-sm">
        <div className="text-white text-[11px] font-bold leading-tight">{label}</div>
        <div className="text-white/70 text-[9px] leading-tight mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

interface MiniCardProps {
  img: string;
  label: string;
}

function MiniCard({ img, label }: MiniCardProps) {
  return (
    <div className="flex items-center gap-2.5 bg-white/12 border border-white/25 rounded-xl px-3 py-2.5 backdrop-blur-md">
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/20">
        <Image src={img} alt={label} width={40} height={40} className="object-cover w-full h-full" />
      </div>
      <span className="text-white text-xs font-semibold leading-tight">{label}</span>
    </div>
  );
}

const TRUST_BADGE_ICONS = [
  // Fast Delivery
  <path key="d" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />,
  // Quality Guaranteed
  <path key="q" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
  // Easy Payment
  <path key="p" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
  // Custom Designs
  <path key="c" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
];

const TRUST_BADGE_COLORS = [
  "bg-indigo-50 text-indigo-600",
  "bg-emerald-50 text-emerald-600",
  "bg-orange-50 text-orange-500",
  "bg-purple-50 text-purple-600",
];

export default function HomePageClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    Promise.all([
      fetch("/api/storefront/categories", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/storefront/products?featured=true&limit=8", { credentials: "include" }).then((r) => r.json()),
    ]).then(([catData, prodData]) => {
      setCategories(catData?.data ?? []);
      setFeatured(prodData?.data ?? []);
    }).finally(() => setLoading(false));

    fetch("/api/storefront/site-settings", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data) setSettings(d.data); })
      .catch(() => {});
  }, []);

  const { hero, heroCards, trustBadges, customCta } = settings;

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden flex items-center lg:min-h-[620px]">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="/hero.png"
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/85 via-indigo-800/80 to-purple-900/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-4 xl:py-6">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-3 xl:gap-6">

            {/* Left: text — 40% on desktop */}
            <div className="flex-1 min-w-0 text-white text-center lg:text-left">
              <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest backdrop-blur-sm">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                {hero.badge}
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-5xl 2xl:text-6xl font-extrabold leading-[1.1] mb-4 tracking-tight">
                {hero.titleLine1}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-200">
                  {hero.titleLine2}
                </span>
              </h1>

              <p className="text-indigo-100/90 text-sm sm:text-base lg:text-base mb-7 leading-relaxed max-w-sm mx-auto lg:mx-0">
                {hero.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href={hero.primaryCtaHref}
                  className="press group inline-flex items-center justify-center gap-2 bg-white text-indigo-700 font-bold px-6 py-3 rounded-full hover:bg-indigo-50 transition-[background-color,transform] duration-200 shadow-xl text-sm"
                >
                  {hero.primaryCtaText}
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href={hero.secondaryCtaHref}
                  className="press inline-flex items-center justify-center gap-2 border-2 border-white/70 text-white font-bold px-6 py-3 rounded-full hover:bg-white/10 hover:border-white transition-[background-color,border-color,transform] duration-200 text-sm backdrop-blur-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  {hero.secondaryCtaText}
                </Link>
              </div>
            </div>

            {/* Right: fixed-size visual container — desktop (lg+) only */}
            <div className="flex-shrink-0 relative hidden lg:block w-[600px] xl:w-[720px] h-[570px] xl:h-[620px]">

              {/* Ambient glow — dual layer */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[28rem] h-[28rem] xl:w-[32rem] xl:h-[32rem] bg-indigo-600/40 rounded-full blur-3xl" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 xl:w-80 xl:h-80 bg-purple-500/30 rounded-full blur-2xl" />
              </div>

              {/* Printer — oversized vs container so it feels dominant; section overflow-hidden clips edges */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[720px] h-[720px] xl:w-[840px] xl:h-[840px] z-10">
                  <Image
                    src={hero.printerImageUrl}
                    alt={hero.printerImageAlt}
                    fill
                    className="object-contain drop-shadow-[0_24px_72px_rgba(99,102,241,0.65)]"
                    priority
                    sizes="(max-width: 1280px) 720px, 840px"
                  />
                </div>
              </div>

              {/* Floating cards — positioned in the side/corner margins away from printer body */}
              <FloatingCard
                img={heroCards[0].imageUrl}
                label={heroCards[0].title}
                sub={heroCards[0].subtitle}
                className="absolute top-[3%] left-[0%] -rotate-3 z-20 w-[155px] h-[130px] xl:w-[168px] xl:h-[142px]"
              />
              <FloatingCard
                img={heroCards[1].imageUrl}
                label={heroCards[1].title}
                sub={heroCards[1].subtitle}
                className="absolute top-[3%] right-[0%] rotate-3 z-20 w-[155px] h-[130px] xl:w-[168px] xl:h-[142px]"
              />
              <FloatingCard
                img={heroCards[2].imageUrl}
                label={heroCards[2].title}
                sub={heroCards[2].subtitle}
                className="absolute bottom-[3%] left-[0%] rotate-2 z-20 w-[155px] h-[130px] xl:w-[168px] xl:h-[142px]"
              />
              <FloatingCard
                img={heroCards[3].imageUrl}
                label={heroCards[3].title}
                sub={heroCards[3].subtitle}
                className="absolute bottom-[3%] right-[0%] -rotate-2 z-20 w-[155px] h-[130px] xl:w-[168px] xl:h-[142px]"
              />
            </div>

            {/* Mobile / tablet — stacked, 2 mini cards only */}
            <div className="lg:hidden flex flex-col items-center gap-4 w-full">
              <div className="relative w-52 h-52 sm:w-64 sm:h-64">
                <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-2xl" />
                <Image
                  src={hero.printerImageUrl}
                  alt={hero.printerImageAlt}
                  fill
                  className="object-contain relative z-10 drop-shadow-2xl"
                  sizes="(max-width: 640px) 208px, 256px"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs">
                <MiniCard img={heroCards[0].imageUrl} label={heroCards[0].title} />
                <MiniCard img={heroCards[1].imageUrl} label={heroCards[1].title} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust badges (overlapping hero bottom) ── */}
      <div className="relative z-10 -mt-8 sm:-mt-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-6 py-7 sm:px-10 sm:py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-8">
              {trustBadges.map((b, i) => (
                <div key={`${b.title}-${i}`} className="flex items-center gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${TRUST_BADGE_COLORS[i] ?? TRUST_BADGE_COLORS[0]}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      {TRUST_BADGE_ICONS[i] ?? TRUST_BADGE_ICONS[0]}
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 text-sm leading-tight">{b.title}</div>
                    <div className="text-gray-500 text-xs mt-0.5 leading-tight">{b.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-12 pb-12 sm:pb-16 space-y-12 sm:space-y-16">

        {/* Categories */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-6 sm:mb-7">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Shop by Category</h2>
              <p className="text-gray-500 text-sm mt-1">Find exactly what you need</p>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-1.5 -mr-1 sm:mr-0 px-2 py-1.5 rounded-lg text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold transition-colors"
            >
              View all
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <CategorySkeleton key={i} />)
              : categories.length === 0
              ? (
                <div className="col-span-full text-center py-12 text-gray-400 text-sm">
                  No categories yet.
                </div>
              )
              : categories.slice(0, 12).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="lift group bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 text-center hover:border-indigo-200"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-100 transition-colors duration-200">
                    <CategoryIcon
                      iconKey={cat.iconKey}
                      className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 transition-transform duration-200 group-hover:scale-110"
                    />
                  </div>
                  <div className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors leading-tight">
                    {cat.name}
                  </div>
                  {cat._count && (
                    <div className="text-xs text-gray-400 mt-1 tabular-nums">{cat._count.products} products</div>
                  )}
                </Link>
              ))
            }
          </div>
        </section>

        {/* Featured Products */}
        {(loading || featured.length > 0) && (
          <section>
            <div className="flex items-end justify-between gap-4 mb-6 sm:mb-7">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Featured Products</h2>
                <p className="text-gray-500 text-sm mt-1">Handpicked for you</p>
              </div>
              <Link
                href="/shop?featured=true"
                className="group inline-flex items-center gap-1.5 -mr-1 sm:mr-0 px-2 py-1.5 rounded-lg text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold transition-colors"
              >
                View all
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {featured.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </section>
        )}

        {/* Custom Request CTA */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 p-8 sm:p-10 md:p-14 text-white text-center shadow-2xl shadow-orange-200">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 400 200" fill="currentColor" aria-hidden="true">
              <circle cx="360" cy="20" r="80" />
              <circle cx="40" cy="180" r="60" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">{customCta.title}</h2>
            <p className="text-orange-100 mb-8 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              {customCta.description}
            </p>
            <Link
              href={customCta.buttonHref}
              className="press inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-3.5 rounded-full hover:bg-orange-50 transition-[background-color,transform] duration-200 shadow-xl text-sm sm:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              {customCta.buttonText}
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

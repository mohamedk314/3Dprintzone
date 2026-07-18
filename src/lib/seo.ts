/**
 * Shared SEO helpers used by page metadata, JSON-LD builders, sitemap,
 * robots, and llms.txt. Pure functions only — safe to import from any
 * server component or route handler.
 */

import type { Metadata } from "next";

/**
 * Canonical production origin for absolute URLs in metadata, sitemap,
 * robots, and structured data.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL  (explicit SEO override)
 *   2. NEXT_PUBLIC_APP_URL   (existing app-wide URL)
 *   3. production default / localhost for local development
 */
export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/+$/, "");
  return process.env.NODE_ENV === "production"
    ? "https://3dprintzone.com"
    : "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = getSiteUrl();
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Truncate at a word boundary so meta descriptions never cut mid-word. */
export function truncateAtWord(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trimEnd()}…`;
}

export interface ProductSeoSource {
  name: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  categoryName?: string | null;
}

/** Per-product SEO title with automatic fallback to the product name. */
export function productSeoTitle(p: ProductSeoSource): string {
  const title = p.seoTitle?.trim() || p.name.trim();
  return truncateAtWord(title, 70);
}

/**
 * Per-product meta description with layered fallbacks:
 * admin SEO description → short description → full description → generated.
 */
export function productSeoDescription(p: ProductSeoSource, brandLabel: string): string {
  const source =
    p.seoDescription?.trim() ||
    p.shortDescription?.trim() ||
    p.description?.trim() ||
    `${p.name}${p.categoryName ? ` — ${p.categoryName}` : ""} by ${brandLabel}. Quality 3D printed products delivered across Egypt.`;
  return truncateAtWord(source, 170);
}

/**
 * Natural keyword list: admin keywords first, then product name, category,
 * and brand themes. Deduplicated, capped, never stuffed.
 */
export function productSeoKeywords(p: ProductSeoSource, brandThemes: string[]): string[] {
  const fromAdmin = (p.seoKeywords ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const generated = [p.name, p.categoryName ?? "", ...brandThemes].filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const k of [...fromAdmin, ...generated]) {
    const key = k.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(k);
    }
  }
  return out.slice(0, 12);
}

/** Alt-text fallback used wherever a product image has no stored alt. */
export function productImageAlt(name: string, alt?: string | null): string {
  return alt?.trim() || `${name} — product image`;
}

/**
 * Remove null/undefined/empty values recursively so JSON-LD output never
 * contains empty fields (Google flags them).
 */
export function cleanJsonLd<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((v) => cleanJsonLd(v))
      .filter((v) => v !== undefined && v !== null && v !== "") as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const cleaned = cleanJsonLd(v);
      if (
        cleaned !== undefined &&
        cleaned !== null &&
        cleaned !== "" &&
        !(Array.isArray(cleaned) && cleaned.length === 0)
      ) {
        out[k] = cleaned;
      }
    }
    return out as T;
  }
  return value;
}

/** Serialize JSON-LD for a <script> tag, escaping "<" to prevent injection. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(cleanJsonLd(data)).replace(/</g, "\\u003c");
}

/**
 * Metadata for simple settings-driven pages (legal, contact). Titles from
 * settings already include the brand name, so they're used as-is (absolute)
 * instead of going through the layout title template.
 */
export function pageMetadata(opts: {
  title: string;
  description: string;
  canonical: string;
  siteName?: string;
}): Metadata {
  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: { canonical: opts.canonical },
    openGraph: {
      title: opts.title,
      description: opts.description,
      type: "website",
      url: opts.canonical,
      ...(opts.siteName ? { siteName: opts.siteName } : {}),
    },
    twitter: {
      card: "summary",
      title: opts.title,
      description: opts.description,
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Keyword themes appended to generated product keywords, per brand. */
export const BRAND_KEYWORD_THEMES: Record<string, string[]> = {
  "3dprintzone": [
    "3D printing Egypt",
    "custom 3D printing",
    "3D printed products",
    "3D printing store",
  ],
  rayk: [
    "3D printed lighting",
    "lighting fixtures Egypt",
    "home decor Egypt",
    "RAYK",
  ],
};

/** Validation limits shared by the admin product APIs and the admin form UI. */
export const PRODUCT_SEO_LIMITS = {
  title: 100,
  description: 300,
  keywords: 300,
} as const;

/**
 * Normalize an optional SEO string field from an API body:
 * trim, enforce max length, empty → null. Returns `{ error }` when invalid.
 */
export function normalizeSeoField(
  value: unknown,
  max: number
): string | null | { error: string } {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return { error: "must be a string" };
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > max) return { error: `must be at most ${max} characters` };
  return trimmed;
}

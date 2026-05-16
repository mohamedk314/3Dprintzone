/**
 * Pure types + defaults for site settings.
 *
 * Why split from site-settings.ts: client components need the SiteSettings
 * shape and the defaults for fallback values, but they must not pull in
 * Prisma (server-only). This module has no Node-only imports.
 */

export interface HeroCard {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
}

export interface TrustBadge {
  title: string;
  subtitle: string;
}

export type LegalPageSlug = "privacy-policy" | "terms" | "refund-policy" | "shipping-policy";

export const LEGAL_PAGE_SLUGS: LegalPageSlug[] = [
  "privacy-policy",
  "terms",
  "refund-policy",
  "shipping-policy",
];

export interface LegalPage {
  title: string;
  metaTitle: string;
  metaDescription: string;
  body: string;
  enabled: boolean;
}

export interface ContactPage {
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  workingHours: string;
  mapEmbedUrl: string;
}

export interface BrandSeo {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

export interface RaykFeature {
  title: string;
  subtitle: string;
}

export interface RaykContactOverrides {
  /** Empty string means "fall back to the General contact value". */
  phone: string;
  whatsappPhone: string;
  email: string;
  address: string;
  workingHours: string;
  instagramUrl: string;
  instagramHandle: string;
}

export interface RaykLightingFixture {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  linkHref: string;
  enabled: boolean;
  sortOrder: number;
}

export interface MaintenanceSettings {
  enabled: boolean;
  title: string;
  message: string;
  expectedBackText: string;
}

export interface RaykSettings {
  hero: {
    /** Small label above the RAYK wordmark, e.g. "CUSTOM 3D PRINTED" */
    kicker: string;
    /** Highlighted title accent below, e.g. "LIGHTING FIXTURES" */
    titleAccent: string;
    /** Short description under the title. */
    subtitle: string;
    ctaText: string;
    ctaHref: string;
    backgroundImageUrl: string;
    backgroundImageAlt: string;
  };
  /** Three lighting-fixture images that float beside the RAYK hero. */
  lightingFixtures: [RaykLightingFixture, RaykLightingFixture, RaykLightingFixture];
  heroFeatures: [RaykFeature, RaykFeature, RaykFeature, RaykFeature];
  benefits: [RaykFeature, RaykFeature, RaykFeature, RaykFeature];
  bottomFeatures: [RaykFeature, RaykFeature, RaykFeature, RaykFeature];
  sections: {
    categoriesEyebrow: string;
    categoriesTitle: string;
    categoriesViewAllText: string;
    testimonialsKicker: string;
    testimonialsTitle: string;
  };
  announcement: {
    text: string;
    enabled: boolean;
  };
  footer: {
    tagline: string;
    copyright: string;
  };
  seo: BrandSeo;
  /** Per-RAYK overrides — empty values fall back to the general contact. */
  contactOverrides: RaykContactOverrides;
  legalPages: Record<LegalPageSlug, LegalPage>;
  contactPage: ContactPage;
}

export interface SiteSettings {
  contact: {
    phone: string;
    whatsappPhone: string;
    email: string;
    address: string;
    instagramUrl: string;
    instagramHandle: string;
    instapayHandle: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    primaryCtaText: string;
    primaryCtaHref: string;
    secondaryCtaText: string;
    secondaryCtaHref: string;
    printerImageUrl: string;
    printerImageAlt: string;
  };
  heroCards: [HeroCard, HeroCard, HeroCard, HeroCard];
  trustBadges: [TrustBadge, TrustBadge, TrustBadge, TrustBadge];
  customCta: {
    title: string;
    description: string;
    buttonText: string;
    buttonHref: string;
  };
  footer: {
    tagline: string;
    copyright: string;
  };
  legalPages: Record<LegalPageSlug, LegalPage>;
  contactPage: ContactPage;
  /** SEO defaults used as fallback by every page that doesn't set its own meta. */
  seo: BrandSeo;
  /** 3dprintzone-specific homepage SEO override. */
  printzoneSeo: BrandSeo;
  /** Site-wide maintenance gate. When `enabled`, public storefront pages render a maintenance screen; admin stays accessible. */
  maintenance: MaintenanceSettings;
  rayk: RaykSettings;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  contact: {
    phone: "+201012708316",
    whatsappPhone: "201012708316",
    email: "info@3dprintzone.com",
    address: "Egypt",
    instagramUrl: "https://instagram.com/3dprintzone.eg",
    instagramHandle: "@3dprintzone.eg",
    instapayHandle: "3dprintzone@instapay",
  },
  hero: {
    badge: "Premium 3D Printing in Egypt",
    titleLine1: "Bring Your Ideas",
    titleLine2: "to Life in 3D",
    subtitle:
      "Shop ready-made 3D printed products or request a fully custom design. Fast delivery across Egypt.",
    primaryCtaText: "Shop Now",
    primaryCtaHref: "/shop",
    secondaryCtaText: "Custom Request",
    secondaryCtaHref: "/custom-request",
    printerImageUrl: "/3dprinter.png",
    printerImageAlt: "3D Printer",
  },
  heroCards: [
    { title: "Custom Bust", subtitle: "High Detail", imageUrl: "/bust.png", imageAlt: "Custom Bust" },
    { title: "Home Decor", subtitle: "Unique Designs", imageUrl: "/homedecor.png", imageAlt: "Home Decor" },
    { title: "Engineering Parts", subtitle: "Strong & Durable", imageUrl: "/mechanicalpart.png", imageAlt: "Engineering Parts" },
    { title: "Desk Accessories", subtitle: "Practical & Stylish", imageUrl: "/penholder.png", imageAlt: "Desk Accessories" },
  ],
  trustBadges: [
    { title: "Fast Delivery",      subtitle: "Across Egypt" },
    { title: "Quality Guaranteed", subtitle: "Precision printing" },
    { title: "Easy Payment",       subtitle: "COD & InstaPay" },
    { title: "Custom Designs",     subtitle: "Any size or shape" },
  ],
  customCta: {
    title: "Need a Custom 3D Print?",
    description:
      "Send us your design or describe what you need. Architecture models, custom gifts, dental, and mechanical parts — we handle it all.",
    buttonText: "Submit a Request",
    buttonHref: "/custom-request",
  },
  footer: {
    tagline: "Premium 3D printing products and services in Egypt. Quality prints, fast delivery.",
    copyright: "© 2025 3Dprintzone. All rights reserved.",
  },
  legalPages: {
    "privacy-policy": {
      title: "Privacy Policy",
      metaTitle: "Privacy Policy – 3Dprintzone",
      metaDescription: "How 3Dprintzone collects, uses, and protects your personal information.",
      enabled: true,
      body: `Last updated: 2026

This Privacy Policy explains how 3Dprintzone collects and uses your information when you use our website and services.

Information we collect
We collect information you provide directly to us when placing an order, submitting a custom request, contacting support, or signing up for an account. This typically includes your name, contact details, shipping address, and order history.

How we use it
We use this information to process and deliver your orders, respond to your questions, improve our products and service, and send important account or order updates.

Sharing
We do not sell your personal information. We share data only with delivery partners and payment providers strictly to fulfill your order.

Your rights
You can request a copy of the personal data we hold about you, ask us to correct it, or request deletion by contacting us through the channels on the Contact page.

Contact
For any privacy-related questions, please contact us through the Contact page.`,
    },
    terms: {
      title: "Terms & Conditions",
      metaTitle: "Terms & Conditions – 3Dprintzone",
      metaDescription: "Terms and conditions for using 3Dprintzone and purchasing our products.",
      enabled: true,
      body: `Last updated: 2026

By using 3Dprintzone, you agree to these terms.

Orders
All orders are subject to product availability and confirmation. Prices and product details may change without notice. We may refuse or cancel an order at any time, in which case we will notify you and process any necessary refund.

Custom prints
Custom orders are produced based on the specifications you provide. Once production begins, custom prints generally cannot be modified or canceled.

Payment
We currently accept Cash on Delivery and InstaPay. Online payment options may be added in the future.

Limitation of liability
3Dprintzone is not liable for indirect, incidental, or consequential damages arising from the use of our products or services beyond the value of the order.

Changes
We may update these terms from time to time. The latest version will always be available on this page.`,
    },
    "refund-policy": {
      title: "Refund Policy",
      metaTitle: "Refund Policy – 3Dprintzone",
      metaDescription: "Our refund and return policy for 3Dprintzone purchases.",
      enabled: true,
      body: `Last updated: 2026

Standard products
If your item arrives damaged or defective, please contact us within 7 days of delivery. We will arrange a replacement or refund after reviewing the issue.

Custom prints
Custom-made items are non-refundable once production has started, unless they arrive damaged or significantly different from the agreed specifications.

How to request a refund
Reach out to us via WhatsApp or the Contact page with your order reference and a short description of the issue. We will respond within 24 hours.

Processing time
Approved refunds are issued back to the original payment method or by another agreed method within 7 business days.`,
    },
    "shipping-policy": {
      title: "Shipping Policy",
      metaTitle: "Shipping Policy – 3Dprintzone",
      metaDescription: "Delivery times, shipping fees, and coverage areas for 3Dprintzone orders.",
      enabled: true,
      body: `Last updated: 2026

Coverage
We deliver across Egypt. Some governorates may have longer delivery times or different shipping fees, configured per shipping zone.

Delivery time
Standard delivery typically takes 2–5 business days after the order is confirmed. Custom prints take longer depending on the design and quantity.

Shipping fees
Shipping fees depend on the shipping zone and method. You will see the exact fee at checkout. For certain large or custom items, shipping is quoted after the order.

Tracking
Once your order is shipped you can track it from the Track Order page using your order reference.`,
    },
  },
  contactPage: {
    title: "Contact Us",
    metaTitle: "Contact – 3Dprintzone",
    metaDescription: "Get in touch with 3Dprintzone — phone, WhatsApp, and email.",
    intro:
      "We are happy to help with anything related to your order, a custom 3D print, or general questions. Reach out through any of the channels below.",
    workingHours: "Sunday – Thursday, 10:00 – 18:00 (Cairo time)",
    mapEmbedUrl: "",
  },
  seo: {
    metaTitle: "3Dprintzone – Premium 3D Printing in Egypt",
    metaDescription:
      "Shop ready-made 3D printed products or request a fully custom design. Fast delivery across Egypt.",
    ogImage: "/hero.png",
  },
  printzoneSeo: {
    metaTitle: "3Dprintzone – Premium 3D Printing in Egypt",
    metaDescription:
      "Shop ready-made 3D printed products or request a fully custom design. Fast delivery across Egypt.",
    ogImage: "/hero.png",
  },
  maintenance: {
    enabled: false,
    title: "We'll be right back",
    message:
      "We're making a few quick updates to improve your experience. The storefront will be back online shortly — thank you for your patience.",
    expectedBackText: "",
  },
  rayk: {
    hero: {
      kicker: "Custom 3D Printed",
      titleAccent: "Lighting Fixtures",
      subtitle: "Unique designs. Precision printed. Made to light up your space.",
      ctaText: "Shop Now",
      ctaHref: "/rayk/shop",
      backgroundImageUrl: "/rayk/hero.png",
      backgroundImageAlt: "RAYK ambient interior",
    },
    lightingFixtures: [
      {
        title: "Pendant Glow",
        description: "Hand-printed pendant lamp with warm diffusion.",
        imageUrl: "/rayk/lamp1.png",
        imageAlt: "RAYK pendant lamp",
        linkHref: "",
        enabled: true,
        sortOrder: 0,
      },
      {
        title: "Ambient Bloom",
        description: "Centerpiece lamp with sculpted lattice shade.",
        imageUrl: "/rayk/lamp2.png",
        imageAlt: "RAYK centerpiece lamp",
        linkHref: "",
        enabled: true,
        sortOrder: 1,
      },
      {
        title: "Architect Tower",
        description: "Statement floor fixture with vertical ribbing.",
        imageUrl: "/rayk/lamp3.png",
        imageAlt: "RAYK architectural floor lamp",
        linkHref: "",
        enabled: true,
        sortOrder: 2,
      },
    ],
    heroFeatures: [
      { title: "3D Printed With Precision", subtitle: "" },
      { title: "Custom Colors & Finishes", subtitle: "" },
      { title: "Durable & Lightweight", subtitle: "" },
      { title: "Secure Packaging & Fast Shipping", subtitle: "" },
    ],
    benefits: [
      { title: "Fast Delivery", subtitle: "Across Egypt" },
      { title: "Quality Guaranteed", subtitle: "Precision printing" },
      { title: "Easy Payment", subtitle: "COD & InstaPay" },
      { title: "Custom Designs", subtitle: "Any size or shape" },
    ],
    bottomFeatures: [
      { title: "Modern Designs", subtitle: "Minimal, elegant & timeless." },
      { title: "Custom Made", subtitle: "Tailored to your style." },
      { title: "Premium Quality", subtitle: "Built to last." },
      { title: "Made Locally", subtitle: "Proudly 3D printed in Egypt." },
    ],
    sections: {
      categoriesEyebrow: "",
      categoriesTitle: "Shop by Category",
      categoriesViewAllText: "View All",
      testimonialsKicker: "Loved by our customers",
      testimonialsTitle: "What they say",
    },
    announcement: {
      text: "",
      enabled: false,
    },
    footer: {
      tagline: "Premium fashion and lifestyle. Crafted for those who move differently.",
      copyright: "© 2025 RAYK. All rights reserved.",
    },
    seo: {
      metaTitle: "RAYK – 3D Printed Gifts & Accessories",
      metaDescription:
        "Discover unique 3D printed gifts and accessories by RAYK. Premium quality, delivered across Egypt.",
      ogImage: "/rayk/hero.png",
    },
    contactOverrides: {
      phone: "",
      whatsappPhone: "",
      email: "",
      address: "",
      workingHours: "",
      instagramUrl: "https://instagram.com/rayk.egy",
      instagramHandle: "@rayk.egy",
    },
    legalPages: {
      "privacy-policy": {
        title: "Privacy Policy",
        metaTitle: "Privacy Policy – RAYK",
        metaDescription: "How RAYK collects, uses, and protects your personal information.",
        enabled: true,
        body: `Last updated: 2026

This Privacy Policy explains how RAYK collects and uses your information when you visit our website and place an order.

Information we collect
We collect details you provide when placing an order or contacting us — name, contact details, shipping address, and order history.

How we use it
We use this information to process and deliver your orders, respond to your questions, and improve our service.

Sharing
We do not sell your personal information. We share data only with delivery partners and payment providers strictly to fulfill your order.

Your rights
You can request a copy of your personal data or ask us to delete it by contacting us through the channels on the Contact page.`,
      },
      terms: {
        title: "Terms & Conditions",
        metaTitle: "Terms & Conditions – RAYK",
        metaDescription: "Terms and conditions for using the RAYK website and purchasing our products.",
        enabled: true,
        body: `Last updated: 2026

By using RAYK, you agree to these terms.

Orders
All orders are subject to product availability and confirmation. Prices and product details may change without notice.

Custom prints
Custom-made items follow your specifications. Once production has started, custom items generally cannot be modified or canceled.

Payment
We currently accept Cash on Delivery and InstaPay.

Changes
We may update these terms over time. The latest version is always available on this page.`,
      },
      "refund-policy": {
        title: "Refund Policy",
        metaTitle: "Refund Policy – RAYK",
        metaDescription: "Our refund and return policy for RAYK purchases.",
        enabled: true,
        body: `Last updated: 2026

Standard products
If your item arrives damaged or defective, please contact us within 7 days of delivery. We will arrange a replacement or refund after reviewing the issue.

Custom items
Custom-made items are non-refundable once production has started, unless they arrive damaged or significantly different from the agreed specifications.

How to request a refund
Reach out through WhatsApp or the Contact page with your order reference and a short description of the issue.`,
      },
      "shipping-policy": {
        title: "Shipping Policy",
        metaTitle: "Shipping Policy – RAYK",
        metaDescription: "Delivery times, shipping fees, and coverage areas for RAYK orders.",
        enabled: true,
        body: `Last updated: 2026

Coverage
We deliver across Egypt. Some governorates may have longer delivery times or different shipping fees.

Delivery time
Standard delivery typically takes 2–5 business days after the order is confirmed. Custom items take longer depending on the design.

Shipping fees
Shipping fees depend on the shipping zone and method. You will see the exact fee at checkout.

Tracking
Once your order is shipped you can track it from the Track Order page using your order reference.`,
      },
    },
    contactPage: {
      title: "Contact",
      metaTitle: "Contact – RAYK",
      metaDescription: "Get in touch with RAYK — phone, WhatsApp, and email.",
      intro: "Questions about a product or a custom commission? Reach out through any of the channels below.",
      workingHours: "Sunday – Thursday, 10:00 – 18:00 (Cairo time)",
      mapEmbedUrl: "",
    },
  },
};

function s(v: unknown, max: number, fallback: string): string {
  if (typeof v !== "string") return fallback;
  const t = v.trim();
  if (!t) return fallback;
  return t.length > max ? t.slice(0, max) : t;
}

function mergeCard(input: unknown, fallback: HeroCard): HeroCard {
  const v = (input && typeof input === "object" ? input : {}) as Partial<HeroCard>;
  return {
    title: s(v.title, 60, fallback.title),
    subtitle: s(v.subtitle, 80, fallback.subtitle),
    imageUrl: s(v.imageUrl, 500, fallback.imageUrl),
    imageAlt: s(v.imageAlt, 120, fallback.imageAlt),
  };
}

function mergeBadge(input: unknown, fallback: TrustBadge): TrustBadge {
  const v = (input && typeof input === "object" ? input : {}) as Partial<TrustBadge>;
  return {
    title: s(v.title, 40, fallback.title),
    subtitle: s(v.subtitle, 60, fallback.subtitle),
  };
}

function mergeLegalPage(input: unknown, fallback: LegalPage): LegalPage {
  const v = (input && typeof input === "object" ? input : {}) as Partial<LegalPage>;
  return {
    title: s(v.title, 80, fallback.title),
    metaTitle: s(v.metaTitle, 80, fallback.metaTitle),
    metaDescription: s(v.metaDescription, 200, fallback.metaDescription),
    body: s(v.body, 5_000, fallback.body),
    enabled: typeof v.enabled === "boolean" ? v.enabled : fallback.enabled,
  };
}

function mergeContactPage(input: unknown, fallback: ContactPage): ContactPage {
  const v = (input && typeof input === "object" ? input : {}) as Partial<ContactPage>;
  return {
    title: s(v.title, 80, fallback.title),
    metaTitle: s(v.metaTitle, 80, fallback.metaTitle),
    metaDescription: s(v.metaDescription, 200, fallback.metaDescription),
    intro: s(v.intro, 1_000, fallback.intro),
    workingHours: s(v.workingHours, 200, fallback.workingHours),
    mapEmbedUrl: s(v.mapEmbedUrl, 500, fallback.mapEmbedUrl),
  };
}

function mergeBrandSeo(input: unknown, fallback: BrandSeo): BrandSeo {
  const v = (input && typeof input === "object" ? input : {}) as Partial<BrandSeo>;
  return {
    metaTitle: s(v.metaTitle, 120, fallback.metaTitle),
    metaDescription: s(v.metaDescription, 240, fallback.metaDescription),
    ogImage: s(v.ogImage, 500, fallback.ogImage),
  };
}

/**
 * Merge a feature card (used by RAYK's hero features, benefits, bottom features).
 * Subtitle is intentionally optional — a blank subtitle is preserved (not replaced
 * with the fallback) so admins can render a tighter card.
 */
function mergeFeature(input: unknown, fallback: RaykFeature): RaykFeature {
  const v = (input && typeof input === "object" ? input : {}) as Partial<RaykFeature>;
  const title = s(v.title, 60, fallback.title);
  const subtitleRaw = typeof v.subtitle === "string" ? v.subtitle.trim() : fallback.subtitle;
  return { title, subtitle: subtitleRaw.length > 80 ? subtitleRaw.slice(0, 80) : subtitleRaw };
}

function mergeRaykContactOverrides(input: unknown, fallback: RaykContactOverrides): RaykContactOverrides {
  const v = (input && typeof input === "object" ? input : {}) as Partial<RaykContactOverrides>;
  // Empty string means "use general value". We preserve it as-is.
  const opt = (raw: unknown, max: number, fb: string) => {
    if (typeof raw !== "string") return fb;
    const t = raw.trim();
    return t.length > max ? t.slice(0, max) : t; // may be ""
  };
  return {
    phone: opt(v.phone, 40, fallback.phone),
    whatsappPhone: opt(v.whatsappPhone, 30, fallback.whatsappPhone).replace(/[^0-9]/g, ""),
    email: opt(v.email, 120, fallback.email),
    address: opt(v.address, 200, fallback.address),
    workingHours: opt(v.workingHours, 200, fallback.workingHours),
    instagramUrl: opt(v.instagramUrl, 200, fallback.instagramUrl),
    instagramHandle: opt(v.instagramHandle, 80, fallback.instagramHandle),
  };
}

function mergeLightingFixture(input: unknown, fallback: RaykLightingFixture): RaykLightingFixture {
  const v = (input && typeof input === "object" ? input : {}) as Partial<RaykLightingFixture>;
  return {
    title: s(v.title, 80, fallback.title),
    description: s(v.description, 200, fallback.description),
    imageUrl: s(v.imageUrl, 500, fallback.imageUrl),
    imageAlt: s(v.imageAlt, 120, fallback.imageAlt),
    linkHref: typeof v.linkHref === "string" ? v.linkHref.trim().slice(0, 200) : fallback.linkHref,
    enabled: typeof v.enabled === "boolean" ? v.enabled : fallback.enabled,
    sortOrder: typeof v.sortOrder === "number" && Number.isFinite(v.sortOrder) ? v.sortOrder : fallback.sortOrder,
  };
}

function mergeMaintenance(input: unknown, fallback: MaintenanceSettings): MaintenanceSettings {
  const v = (input && typeof input === "object" ? input : {}) as Partial<MaintenanceSettings>;
  return {
    enabled: typeof v.enabled === "boolean" ? v.enabled : fallback.enabled,
    title: s(v.title, 80, fallback.title),
    message: s(v.message, 600, fallback.message),
    expectedBackText: typeof v.expectedBackText === "string"
      ? v.expectedBackText.trim().slice(0, 200)
      : fallback.expectedBackText,
  };
}

function mergeRaykSettings(input: unknown, fallback: RaykSettings): RaykSettings {
  const r = (input && typeof input === "object" ? input : {}) as Partial<RaykSettings>;
  const hero = (r.hero && typeof r.hero === "object" ? r.hero : {}) as Partial<RaykSettings["hero"]>;
  const sections = (r.sections && typeof r.sections === "object" ? r.sections : {}) as Partial<RaykSettings["sections"]>;
  const announcement = (r.announcement && typeof r.announcement === "object" ? r.announcement : {}) as Partial<RaykSettings["announcement"]>;
  const footer = (r.footer && typeof r.footer === "object" ? r.footer : {}) as Partial<RaykSettings["footer"]>;
  const heroFeatures = Array.isArray(r.heroFeatures) ? r.heroFeatures : [];
  const benefits = Array.isArray(r.benefits) ? r.benefits : [];
  const bottomFeatures = Array.isArray(r.bottomFeatures) ? r.bottomFeatures : [];
  const fixtures = Array.isArray(r.lightingFixtures) ? r.lightingFixtures : [];
  const legalPagesRaw = (r.legalPages && typeof r.legalPages === "object" ? r.legalPages : {}) as Partial<RaykSettings["legalPages"]>;

  return {
    hero: {
      kicker: s(hero.kicker, 60, fallback.hero.kicker),
      titleAccent: s(hero.titleAccent, 60, fallback.hero.titleAccent),
      subtitle: s(hero.subtitle, 240, fallback.hero.subtitle),
      ctaText: s(hero.ctaText, 40, fallback.hero.ctaText),
      ctaHref: s(hero.ctaHref, 200, fallback.hero.ctaHref),
      backgroundImageUrl: s(hero.backgroundImageUrl, 500, fallback.hero.backgroundImageUrl),
      backgroundImageAlt: s(hero.backgroundImageAlt, 120, fallback.hero.backgroundImageAlt),
    },
    lightingFixtures: [
      mergeLightingFixture(fixtures[0], fallback.lightingFixtures[0]),
      mergeLightingFixture(fixtures[1], fallback.lightingFixtures[1]),
      mergeLightingFixture(fixtures[2], fallback.lightingFixtures[2]),
    ],
    heroFeatures: [
      mergeFeature(heroFeatures[0], fallback.heroFeatures[0]),
      mergeFeature(heroFeatures[1], fallback.heroFeatures[1]),
      mergeFeature(heroFeatures[2], fallback.heroFeatures[2]),
      mergeFeature(heroFeatures[3], fallback.heroFeatures[3]),
    ],
    benefits: [
      mergeFeature(benefits[0], fallback.benefits[0]),
      mergeFeature(benefits[1], fallback.benefits[1]),
      mergeFeature(benefits[2], fallback.benefits[2]),
      mergeFeature(benefits[3], fallback.benefits[3]),
    ],
    bottomFeatures: [
      mergeFeature(bottomFeatures[0], fallback.bottomFeatures[0]),
      mergeFeature(bottomFeatures[1], fallback.bottomFeatures[1]),
      mergeFeature(bottomFeatures[2], fallback.bottomFeatures[2]),
      mergeFeature(bottomFeatures[3], fallback.bottomFeatures[3]),
    ],
    sections: {
      categoriesEyebrow: s(sections.categoriesEyebrow, 80, fallback.sections.categoriesEyebrow),
      categoriesTitle: s(sections.categoriesTitle, 80, fallback.sections.categoriesTitle),
      categoriesViewAllText: s(sections.categoriesViewAllText, 40, fallback.sections.categoriesViewAllText),
      testimonialsKicker: s(sections.testimonialsKicker, 80, fallback.sections.testimonialsKicker),
      testimonialsTitle: s(sections.testimonialsTitle, 80, fallback.sections.testimonialsTitle),
    },
    announcement: {
      text: typeof announcement.text === "string" ? announcement.text.trim().slice(0, 200) : fallback.announcement.text,
      enabled: typeof announcement.enabled === "boolean" ? announcement.enabled : fallback.announcement.enabled,
    },
    footer: {
      tagline: s(footer.tagline, 200, fallback.footer.tagline),
      copyright: s(footer.copyright, 120, fallback.footer.copyright),
    },
    seo: mergeBrandSeo(r.seo, fallback.seo),
    contactOverrides: mergeRaykContactOverrides(r.contactOverrides, fallback.contactOverrides),
    legalPages: {
      "privacy-policy": mergeLegalPage(legalPagesRaw["privacy-policy"], fallback.legalPages["privacy-policy"]),
      "terms": mergeLegalPage(legalPagesRaw["terms"], fallback.legalPages["terms"]),
      "refund-policy": mergeLegalPage(legalPagesRaw["refund-policy"], fallback.legalPages["refund-policy"]),
      "shipping-policy": mergeLegalPage(legalPagesRaw["shipping-policy"], fallback.legalPages["shipping-policy"]),
    },
    contactPage: mergeContactPage(r.contactPage, fallback.contactPage),
  };
}

/**
 * Returns a fully-typed SiteSettings object. Any missing/invalid fields fall
 * back to defaults so the storefront cannot break on partial/corrupt data.
 */
export function mergeWithDefaults(raw: unknown): SiteSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<SiteSettings>;
  const d = DEFAULT_SITE_SETTINGS;

  const contact = (r.contact && typeof r.contact === "object" ? r.contact : {}) as Partial<SiteSettings["contact"]>;
  const hero = (r.hero && typeof r.hero === "object" ? r.hero : {}) as Partial<SiteSettings["hero"]>;
  const customCta = (r.customCta && typeof r.customCta === "object" ? r.customCta : {}) as Partial<SiteSettings["customCta"]>;
  const footer = (r.footer && typeof r.footer === "object" ? r.footer : {}) as Partial<SiteSettings["footer"]>;
  const legalPagesRaw = (r.legalPages && typeof r.legalPages === "object" ? r.legalPages : {}) as Partial<SiteSettings["legalPages"]>;
  const contactRaw = (r.contactPage && typeof r.contactPage === "object" ? r.contactPage : {}) as Partial<SiteSettings["contactPage"]>;

  const cardsArray = Array.isArray(r.heroCards) ? r.heroCards : [];
  const badgesArray = Array.isArray(r.trustBadges) ? r.trustBadges : [];

  return {
    contact: {
      phone: s(contact.phone, 40, d.contact.phone),
      whatsappPhone: s(contact.whatsappPhone, 30, d.contact.whatsappPhone).replace(/[^0-9]/g, "") || d.contact.whatsappPhone,
      email: s(contact.email, 120, d.contact.email),
      address: s(contact.address, 200, d.contact.address),
      instagramUrl: s(contact.instagramUrl, 200, d.contact.instagramUrl),
      instagramHandle: s(contact.instagramHandle, 80, d.contact.instagramHandle),
      instapayHandle: s(contact.instapayHandle, 80, d.contact.instapayHandle),
    },
    hero: {
      badge: s(hero.badge, 80, d.hero.badge),
      titleLine1: s(hero.titleLine1, 60, d.hero.titleLine1),
      titleLine2: s(hero.titleLine2, 60, d.hero.titleLine2),
      subtitle: s(hero.subtitle, 240, d.hero.subtitle),
      primaryCtaText: s(hero.primaryCtaText, 40, d.hero.primaryCtaText),
      primaryCtaHref: s(hero.primaryCtaHref, 200, d.hero.primaryCtaHref),
      secondaryCtaText: s(hero.secondaryCtaText, 40, d.hero.secondaryCtaText),
      secondaryCtaHref: s(hero.secondaryCtaHref, 200, d.hero.secondaryCtaHref),
      printerImageUrl: s(hero.printerImageUrl, 500, d.hero.printerImageUrl),
      printerImageAlt: s(hero.printerImageAlt, 120, d.hero.printerImageAlt),
    },
    heroCards: [
      mergeCard(cardsArray[0], d.heroCards[0]),
      mergeCard(cardsArray[1], d.heroCards[1]),
      mergeCard(cardsArray[2], d.heroCards[2]),
      mergeCard(cardsArray[3], d.heroCards[3]),
    ],
    trustBadges: [
      mergeBadge(badgesArray[0], d.trustBadges[0]),
      mergeBadge(badgesArray[1], d.trustBadges[1]),
      mergeBadge(badgesArray[2], d.trustBadges[2]),
      mergeBadge(badgesArray[3], d.trustBadges[3]),
    ],
    customCta: {
      title: s(customCta.title, 80, d.customCta.title),
      description: s(customCta.description, 320, d.customCta.description),
      buttonText: s(customCta.buttonText, 40, d.customCta.buttonText),
      buttonHref: s(customCta.buttonHref, 200, d.customCta.buttonHref),
    },
    footer: {
      tagline: s(footer.tagline, 200, d.footer.tagline),
      copyright: s(footer.copyright, 120, d.footer.copyright),
    },
    legalPages: {
      "privacy-policy": mergeLegalPage(legalPagesRaw["privacy-policy"], d.legalPages["privacy-policy"]),
      "terms": mergeLegalPage(legalPagesRaw["terms"], d.legalPages["terms"]),
      "refund-policy": mergeLegalPage(legalPagesRaw["refund-policy"], d.legalPages["refund-policy"]),
      "shipping-policy": mergeLegalPage(legalPagesRaw["shipping-policy"], d.legalPages["shipping-policy"]),
    },
    contactPage: mergeContactPage(contactRaw, d.contactPage),
    seo: mergeBrandSeo(r.seo, d.seo),
    printzoneSeo: mergeBrandSeo(r.printzoneSeo, d.printzoneSeo),
    maintenance: mergeMaintenance(r.maintenance, d.maintenance),
    rayk: mergeRaykSettings(r.rayk, d.rayk),
  };
}

/**
 * Resolve RAYK contact details using the per-RAYK overrides first,
 * falling back to General contact when an override is left blank.
 */
export function resolveRaykContact(settings: SiteSettings) {
  const o = settings.rayk.contactOverrides;
  const g = settings.contact;
  const pick = (override: string, fallback: string) => (override && override.trim() ? override : fallback);
  return {
    phone: pick(o.phone, g.phone),
    whatsappPhone: pick(o.whatsappPhone, g.whatsappPhone),
    email: pick(o.email, g.email),
    address: pick(o.address, g.address),
    workingHours: pick(o.workingHours, settings.rayk.contactPage.workingHours || g.address),
    instagramUrl: pick(o.instagramUrl, g.instagramUrl),
    instagramHandle: pick(o.instagramHandle, g.instagramHandle),
  };
}

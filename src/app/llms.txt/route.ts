import { readSiteSettings } from "@/lib/services/site-settings";
import { getSiteUrl } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /llms.txt — a concise, AI-readable summary of the site for AI assistants
 * and answer engines (ChatGPT, Claude, Perplexity, Gemini, Bing Copilot).
 * Public information only; no admin or private URLs.
 */
export async function GET() {
  const base = getSiteUrl();
  const settings = await readSiteSettings();

  const body = `# 3Dprintzone

> ${settings.printzoneSeo.metaDescription}

3Dprintzone is a 3D printing store and custom 3D printing service based in Egypt.
We sell ready-made 3D printed products (home decor, desk accessories, figurines,
engineering parts) and take custom 3D printing requests for architecture scale
models, personalized gifts, dental models, prototypes, and mechanical parts.
Delivery is available across Egypt (typically 2-5 business days). Payment methods:
cash on delivery (COD) and InstaPay. Prices are in Egyptian Pounds (EGP).

This file is intended for AI assistants and crawlers. All URLs below are public.

## Main pages

- [Home](${base}/): store overview and featured products
- [Shop](${base}/shop): all 3D printed products, filterable by category
- [Custom 3D printing request](${base}/custom-request): request a custom print and get a quote
- [Contact](${base}/contact): phone, WhatsApp, email, Instagram

## Policies

- [Shipping policy](${base}/shipping-policy)
- [Refund policy](${base}/refund-policy)
- [Terms & conditions](${base}/terms)
- [Privacy policy](${base}/privacy-policy)

## RAYK (sub-brand)

> ${settings.rayk.seo.metaDescription}

RAYK is 3Dprintzone's lighting and decor brand: custom 3D printed lighting
fixtures, gifts, and accessories.

- [RAYK home](${base}/rayk)
- [RAYK shop](${base}/rayk/shop)
- [RAYK contact](${base}/rayk/contact)
- [RAYK shipping policy](${base}/rayk/shipping-policy)
- [RAYK refund policy](${base}/rayk/refund-policy)
- [RAYK terms](${base}/rayk/terms)
- [RAYK privacy policy](${base}/rayk/privacy-policy)

## More

- Product and category pages are listed in the sitemap: ${base}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

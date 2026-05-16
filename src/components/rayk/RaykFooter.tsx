"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEFAULT_SITE_SETTINGS, type RaykSettings, type SiteSettings } from "@/lib/services/site-settings-types";

export default function RaykFooter() {
  const [rayk, setRayk] = useState<RaykSettings>(DEFAULT_SITE_SETTINGS.rayk);
  const [generalContact, setGeneralContact] = useState<SiteSettings["contact"]>(DEFAULT_SITE_SETTINGS.contact);

  useEffect(() => {
    fetch("/api/storefront/site-settings", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && d.data) {
          if (d.data.rayk) setRayk(d.data.rayk);
          if (d.data.contact) setGeneralContact(d.data.contact);
        }
      })
      .catch(() => {});
  }, []);

  // Per-RAYK overrides fall back to general values when blank.
  const igUrl = rayk.contactOverrides.instagramUrl || generalContact.instagramUrl;
  const igHandle = rayk.contactOverrides.instagramHandle || generalContact.instagramHandle || "@rayk.egy";
  const tagline = rayk.footer.tagline;
  const copyright = rayk.footer.copyright;

  return (
    <footer className="bg-black text-white mt-24">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <p className="text-2xl font-bold tracking-[0.3em] uppercase mb-4">RAYK</p>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              {tagline}
            </p>
            {igUrl && (
              <div className="mt-4">
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow RAYK on Instagram"
                  className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="text-xs tracking-widest uppercase">{igHandle}</span>
                </a>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">Shop</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/rayk/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/rayk/cart" className="hover:text-white transition-colors">Cart</Link></li>
              <li><Link href="/rayk/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">Help</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/rayk/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/rayk/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">3Dprintzone</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">Legal</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/rayk/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="/rayk/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link href="/rayk/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/rayk/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/30 tracking-wide">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}

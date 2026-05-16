"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/services/site-settings-types";

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    fetch("/api/storefront/site-settings")
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data) setSettings(d.data); })
      .catch(() => {});
  }, []);

  const c = settings.contact;
  const tagline = settings.footer.tagline;
  const copyright = settings.footer.copyright;

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
              <span className="font-bold text-white text-lg">3Dprintzone</span>
            </div>
            <p className="text-sm leading-relaxed">{tagline}</p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-indigo-400 transition-colors">All Products</Link></li>
              <li><Link href="/custom-request" className="hover:text-indigo-400 transition-colors">Custom Request</Link></li>
              <li><Link href="/cart" className="hover:text-indigo-400 transition-colors">Cart</Link></li>
              <li><Link href="/wishlist" className="hover:text-indigo-400 transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/track-order" className="hover:text-indigo-400 transition-colors">Track Order</Link></li>
              <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-indigo-400 transition-colors">Shipping Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-indigo-400 transition-colors">Refund Policy</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms &amp; Conditions</Link></li>
              <li>
                <a
                  href={`https://wa.me/${c.whatsappPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition-colors"
                >
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <a
                  href={`https://wa.me/${c.whatsappPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition-colors"
                >
                  {c.phone}
                </a>
              </li>
              {c.email && (
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${c.email}`} className="hover:text-indigo-400 transition-colors">{c.email}</a>
                </li>
              )}
              {c.address && (
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{c.address}</span>
                </li>
              )}
              {c.instagramUrl && c.instagramHandle && (
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <a
                    href={c.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow 3Dprintzone on Instagram"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    {c.instagramHandle}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>{copyright}</span>
          <div className="flex items-center gap-3">
            <span>Cash on Delivery</span>
            <span>•</span>
            <span>InstaPay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

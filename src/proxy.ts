import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const ADMIN_PROTECTED_PREFIXES = ["/admin", "/api/admin"];

/** Hostnames like `rayk.3dprintzone-eg.com` serve the RAYK storefront. */
function isRaykHost(request: NextRequest): boolean {
  const host = request.headers.get("host") ?? "";
  return host.toLowerCase().startsWith("rayk.");
}

/**
 * Paths that must never be rewritten to `/rayk/*` on the RAYK subdomain:
 * admin, APIs, Next internals, metadata routes, and static assets. (The
 * matcher already skips `_next/*` and any path containing a dot — favicons,
 * images, robots.txt, sitemap.xml, llms.txt — this is a second guard.)
 */
function isRaykRewriteExcluded(pathname: string): boolean {
  return (
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  );
}

function isProtectedPath(pathname: string): boolean {
  return ADMIN_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPublicAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/auth/request-otp") ||
    pathname.startsWith("/api/admin/auth/verify-otp")
  );
}

/**
 * Pass-through that also forwards `x-pathname` to the origin so server
 * components (notably the root layout's maintenance gate) can read the
 * current path via `headers()`.
 */
function passThroughWithPathname(request: NextRequest, pathname: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("x-pathname", pathname);
  return res;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---------------------------------------------------------------------
  // RAYK subdomain (rayk.3dprintzone-eg.com): serve the existing /rayk/*
  // routes from clean root-level URLs via internal rewrites.
  // ---------------------------------------------------------------------
  if (isRaykHost(request)) {
    // Admin lives on the main domain only — bounce it off the subdomain.
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const mainSite =
        process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
      if (mainSite) {
        return NextResponse.redirect(
          new URL(pathname + request.nextUrl.search, mainSite)
        );
      }
      // No main-site URL configured (e.g. local dev): fall through to the
      // normal admin guard below.
    } else if (pathname === "/rayk" || pathname.startsWith("/rayk/")) {
      // Already-prefixed URLs redirect to the clean form so the subdomain
      // never exposes double-prefixed paths (rayk./rayk/shop → rayk./shop).
      const url = request.nextUrl.clone();
      url.pathname = pathname.slice("/rayk".length) || "/";
      return NextResponse.redirect(url, 308);
    } else if (!isRaykRewriteExcluded(pathname)) {
      // Clean URL → internal /rayk/* route. Not a visible redirect.
      const url = request.nextUrl.clone();
      url.pathname = pathname === "/" ? "/rayk" : `/rayk${pathname}`;
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-pathname", url.pathname);
      const res = NextResponse.rewrite(url, {
        request: { headers: requestHeaders },
      });
      res.headers.set("x-pathname", url.pathname);
      return res;
    }
    // Excluded paths (/api/*, assets) continue through the normal flow.
  }

  // Public storefront routes — never block here. Forward `x-pathname` so the
  // root layout knows which page is being rendered (used by maintenance gate).
  if (!isProtectedPath(pathname)) {
    return passThroughWithPathname(request, pathname);
  }

  // Admin paths that don't require a session token (login page, OTP endpoints).
  if (isPublicAdminPath(pathname)) {
    return passThroughWithPathname(request, pathname);
  }

  // From here on we're guarding /admin/* and /api/admin/* with the session JWT.
  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    return passThroughWithPathname(request, pathname);
  } catch {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = {
  // Run on every request except Next.js internals and static asset files so we
  // can attach `x-pathname` to every page render. The negative lookahead skips:
  //  - `_next/static` and `_next/image` build assets
  //  - `favicon.ico`
  //  - anything ending in a file extension (icon.png, hero.png, etc.)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

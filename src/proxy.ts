import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const ADMIN_PROTECTED_PREFIXES = ["/admin", "/api/admin"];

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

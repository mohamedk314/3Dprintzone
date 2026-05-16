"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface AdminUser { email: string; role: "super_admin" | "admin" }

const NAV_ITEMS = [
  {
    href: "/admin", label: "Dashboard", exact: true, superOnly: false,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/admin/categories", label: "Categories", exact: false, superOnly: false,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    href: "/admin/products", label: "Products", exact: false, superOnly: false,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: "/admin/orders", label: "Orders", exact: false, superOnly: false,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: "/admin/custom-requests", label: "Custom Requests", exact: false, superOnly: false,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    href: "/admin/reviews", label: "Reviews", exact: false, superOnly: false,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    href: "/admin/admins", label: "Admins", exact: false, superOnly: true,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/shipping/zones", label: "Shipping", exact: false, superOnly: false,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
      </svg>
    ),
  },
  {
    href: "/admin/settings", label: "Settings", exact: false, superOnly: true,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme");
    if (saved === "dark") setDarkMode(true);
  }, []);

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("admin-theme", next ? "dark" : "light");
  }

  useEffect(() => {
    if (isLoginPage) { setLoading(false); return; }
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => { if (d.success) setAdmin(d.admin); else router.replace("/admin/login"); })
      .catch(() => router.replace("/admin/login"))
      .finally(() => setLoading(false));
  }, [isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-500 text-sm">
          <svg className="animate-spin w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-xs tracking-wide">Loading admin…</span>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  function isActive(item: { href: string; exact: boolean }) {
    if (item.exact) return pathname === item.href;
    if (item.href === "/admin/shipping/zones") return pathname.startsWith("/admin/shipping");
    return pathname.startsWith(item.href);
  }

  return (
    <div className={`flex min-h-screen ${darkMode ? "bg-gray-950" : "bg-gray-100"}`}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-56 text-white flex flex-col z-30 transition-transform duration-200
        ${darkMode ? "bg-black" : "bg-gray-900"}
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:relative lg:flex`}>
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-800/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-[0_2px_8px_-2px_rgba(99,102,241,0.6)]">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight">3Dprintzone Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.filter((item) => !item.superOnly || admin.role === "super_admin").map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive(item)
                  ? "bg-indigo-600 text-white shadow-[0_2px_8px_-2px_rgba(99,102,241,0.5)]"
                  : "text-gray-400 hover:bg-gray-800/80 hover:text-white"
              }`}
            >
              <span className={isActive(item) ? "" : "transition-transform duration-150 group-hover:scale-110"}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="px-3 mb-2">
            <div className="text-xs text-gray-500 truncate">{admin.email}</div>
            {admin.role === "super_admin" && (
              <span className="inline-block mt-0.5 text-[10px] font-semibold text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded">
                Super Admin
              </span>
            )}
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors mb-1"
          >
            {darkMode ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            {darkMode ? "Light mode" : "Dark mode"}
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-w-0 ${darkMode ? "text-gray-100" : ""}`}>
        {/* Mobile top bar */}
        <div className={`lg:hidden border-b px-4 py-3 flex items-center gap-3 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className={`font-semibold text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>3Dprintzone Admin</span>
        </div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AdminInfo = {
  email: string;
};

type Stats = {
  categories: number | null;
  products: number | null;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [stats, setStats] = useState<Stats>({ categories: null, products: null });
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAdmin(d.admin);
        else router.replace("/admin/login");
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  useEffect(() => {
    if (!admin) return;

    Promise.allSettled([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/products").then((r) => r.json()),
    ]).then(([cats, prods]) => {
      setStats({
        categories: cats.status === "fulfilled" && cats.value.success ? cats.value.data.length : null,
        products:
          prods.status === "fulfilled" && prods.value.success ? prods.value.meta?.total ?? null : null,
      });
    });
  }, [admin]);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  if (!admin) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-sm text-gray-500">Loading...</p>
      </main>
    );
  }

  const sections = [
    {
      title: "Categories",
      description: "Create, update, and soft-delete product categories.",
      stat: stats.categories,
      statLabel: "total",
      endpoints: [
        { method: "GET", path: "/api/admin/categories" },
        { method: "POST", path: "/api/admin/categories" },
        { method: "PATCH", path: "/api/admin/categories/:id" },
        { method: "DELETE", path: "/api/admin/categories/:id" },
      ],
    },
    {
      title: "Products",
      description: "Manage products with pricing, stock, type, and category assignment.",
      stat: stats.products,
      statLabel: "total",
      endpoints: [
        { method: "GET", path: "/api/admin/products" },
        { method: "POST", path: "/api/admin/products" },
        { method: "GET", path: "/api/admin/products/:id" },
        { method: "PATCH", path: "/api/admin/products/:id" },
        { method: "DELETE", path: "/api/admin/products/:id" },
      ],
    },
  ];

  const methodColors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-700",
    POST: "bg-green-100 text-green-700",
    PATCH: "bg-yellow-100 text-yellow-700",
    DELETE: "bg-red-100 text-red-700",
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">{admin.email}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded border px-4 py-2 text-sm disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>

        {/* Auth info */}
        <div className="rounded border bg-white p-5">
          <h2 className="mb-2 font-medium">Authentication</h2>
          <p className="text-sm text-gray-600">
            Admin sessions are OTP-based and JWT + DB-backed. Tokens are stored in
            an <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">httpOnly</code> cookie and
            validated against the database on every protected request.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {[
              "POST /api/admin/auth/request-otp",
              "POST /api/admin/auth/verify-otp",
              "POST /api/admin/auth/logout",
              "GET  /api/admin/me",
            ].map((e) => (
              <code key={e} className="rounded bg-gray-100 px-2 py-1">{e}</code>
            ))}
          </div>
        </div>

        {/* Resource sections */}
        {sections.map((section) => (
          <div key={section.title} className="rounded border bg-white p-5">
            <div className="mb-1 flex items-baseline justify-between">
              <h2 className="font-medium">{section.title}</h2>
              {section.stat !== null && (
                <span className="text-sm text-gray-500">
                  {section.stat} {section.statLabel}
                </span>
              )}
            </div>
            <p className="mb-4 text-sm text-gray-600">{section.description}</p>
            <div className="flex flex-wrap gap-2">
              {section.endpoints.map((ep) => (
                <div
                  key={ep.method + ep.path}
                  className="flex items-center gap-1.5 rounded border px-2 py-1"
                >
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${methodColors[ep.method] ?? ""}`}
                  >
                    {ep.method}
                  </span>
                  <code className="text-xs text-gray-700">{ep.path}</code>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </main>
  );
}

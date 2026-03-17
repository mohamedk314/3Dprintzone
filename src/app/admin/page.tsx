"use client";

import { useEffect, useState } from "react";

type AdminResponse = {
  success: boolean;
  admin?: {
    sessionId: string;
    adminUserId: string;
    email: string;
  };
  message?: string;
};

export default function AdminHomePage() {
  const [data, setData] = useState<AdminResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmin() {
      try {
        const response = await fetch("/api/admin/me");
        const result = await response.json();
        setData(result);
      } finally {
        setLoading(false);
      }
    }

    loadAdmin();
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", {
      method: "POST",
    });

    window.location.href = "/admin/login";
  }

  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  if (!data?.success || !data.admin) {
    return <main className="p-8">Unauthorized</main>;
  }

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p>Logged in as: {data.admin.email}</p>

      <button onClick={handleLogout} className="rounded border px-4 py-2">
        Logout
      </button>
    </main>
  );
}
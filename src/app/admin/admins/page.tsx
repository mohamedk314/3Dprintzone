"use client";

import { useEffect, useState, FormEvent } from "react";

interface AdminUser {
  id: string;
  email: string;
  role: "super_admin" | "admin";
  isActive: boolean;
  createdAt: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load");
      setAdmins(data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load admins");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setAdding(true);
    setAddMsg(null);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to add");
      setAdmins((prev) => [...prev, data.data]);
      setNewEmail("");
      setAddMsg({ text: "Admin added successfully.", ok: true });
    } catch (e) {
      setAddMsg({ text: e instanceof Error ? e.message : "Failed to add", ok: false });
    } finally {
      setAdding(false);
      setTimeout(() => setAddMsg(null), 4000);
    }
  }

  async function toggleActive(admin: AdminUser) {
    setTogglingId(admin.id);
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !admin.isActive }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to update");
      setAdmins((prev) => prev.map((a) => (a.id === admin.id ? data.data : a)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Admin Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage who can access the admin panel.</p>
      </div>

      {/* Add Admin Form */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-4">Add Admin</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="admin@example.com"
            required
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
          />
          <button
            type="submit"
            disabled={adding}
            className="bg-indigo-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0"
          >
            {adding ? "Adding..." : "Add Admin"}
          </button>
        </form>
        {addMsg && (
          <p className={`text-xs mt-3 rounded-lg px-3 py-2 ${addMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {addMsg.text}
          </p>
        )}
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={load} className="text-indigo-600 text-sm mt-2 hover:underline">Retry</button>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No admins found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Added</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{admin.email}</td>
                  <td className="px-5 py-3">
                    {admin.role === "super_admin" ? (
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">Super Admin</span>
                    ) : (
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">Admin</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${admin.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {admin.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {new Date(admin.createdAt).toLocaleDateString("en-EG")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {admin.role === "super_admin" ? (
                      <span className="text-xs text-gray-300">—</span>
                    ) : (
                      <button
                        onClick={() => toggleActive(admin)}
                        disabled={togglingId === admin.id}
                        className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors disabled:opacity-50 ${
                          admin.isActive
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {togglingId === admin.id ? "..." : admin.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

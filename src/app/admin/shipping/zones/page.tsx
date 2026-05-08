"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ShippingZone {
  id: string;
  name: string;
  governorates: string;
  priceOverride: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  isActive: boolean;
  brand: string;
}

const BRAND_OPTIONS = [
  { value: "both", label: "Both brands" },
  { value: "3dprintzone", label: "3Dprintzone only" },
  { value: "rayk", label: "RAYK only" },
];

const EGYPT_GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira", "Fayoum",
  "Gharbia", "Ismailia", "Menofia", "Minya", "Qalyubia", "New Valley", "Suez",
  "Aswan", "Assiut", "Beni Suef", "Port Said", "Damietta", "Sharkia", "South Sinai",
  "Kafr El Sheikh", "Matruh", "Luxor", "Qena", "North Sinai", "Sohag",
];

const emptyForm = { name: "", selectedGovernorates: [] as string[], priceOverride: "0", estimatedDaysMin: "1", estimatedDaysMax: "3", isActive: true, brand: "both" };

export default function AdminShippingZonesPage() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/shipping/zones");
    const data = await res.json();
    setZones(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function flash(text: string, ok: boolean) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  }

  function startNew() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function toggleGovernorate(gov: string) {
    setForm((f) => ({
      ...f,
      selectedGovernorates: f.selectedGovernorates.includes(gov)
        ? f.selectedGovernorates.filter((g) => g !== gov)
        : [...f.selectedGovernorates, gov],
    }));
  }

  function startEdit(zone: ShippingZone) {
    setForm({
      name: zone.name,
      selectedGovernorates: zone.governorates.split(",").map((g) => g.trim()).filter(Boolean),
      priceOverride: String(zone.priceOverride),
      estimatedDaysMin: String(zone.estimatedDaysMin),
      estimatedDaysMax: String(zone.estimatedDaysMax),
      isActive: zone.isActive,
      brand: zone.brand,
    });
    setEditingId(zone.id);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.selectedGovernorates.length === 0) {
        flash("Please select at least one governorate.", false);
        setSaving(false);
        return;
      }
      const body = {
        name: form.name,
        governorates: form.selectedGovernorates.join(", "),
        priceOverride: Number(form.priceOverride),
        estimatedDaysMin: Number(form.estimatedDaysMin),
        estimatedDaysMax: Number(form.estimatedDaysMax),
        isActive: form.isActive,
        brand: form.brand,
      };
      const url = editingId ? `/api/admin/shipping/zones/${editingId}` : "/api/admin/shipping/zones";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        flash(editingId ? "Zone updated." : "Zone created.", true);
        cancelForm();
        load();
      } else {
        flash(data.message || "Save failed.", false);
      }
    } catch {
      flash("Network error.", false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this shipping zone?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/shipping/zones/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { flash("Zone deleted.", true); load(); }
      else flash(data.message || "Delete failed.", false);
    } catch {
      flash("Network error.", false);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Shipping Zones</h1>
          <p className="text-xs text-gray-500 mt-0.5">Define zones by governorate with custom pricing</p>
        </div>
        <div className="flex gap-2 items-center">
          <Link href="/admin/shipping/methods" className="text-sm text-indigo-600 hover:underline font-medium">Methods →</Link>
          <button onClick={startNew}
            className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            + New Zone
          </button>
        </div>
      </div>

      {msg && (
        <div className={`text-sm rounded-lg px-4 py-2.5 ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white border border-indigo-100 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm">{editingId ? "Edit Zone" : "New Zone"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Zone Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Greater Cairo"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Price Override (EGP) *</label>
              <input required type="number" min="0" step="0.01" value={form.priceOverride}
                onChange={(e) => setForm({ ...form, priceOverride: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
              Governorates *
              <span className="ml-2 font-normal text-gray-400">({form.selectedGovernorates.length} selected)</span>
            </label>
            <div className="border border-gray-200 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-52 overflow-y-auto">
              {EGYPT_GOVERNORATES.map((gov) => (
                <label key={gov} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors ${
                  form.selectedGovernorates.includes(gov) ? "bg-indigo-50 text-indigo-800" : "hover:bg-gray-50 text-gray-700"
                }`}>
                  <input
                    type="checkbox"
                    checked={form.selectedGovernorates.includes(gov)}
                    onChange={() => toggleGovernorate(gov)}
                    className="accent-indigo-600 shrink-0"
                  />
                  {gov}
                </label>
              ))}
            </div>
            {form.selectedGovernorates.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">{form.selectedGovernorates.join(", ")}</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Min Days</label>
              <input type="number" min="1" value={form.estimatedDaysMin}
                onChange={(e) => setForm({ ...form, estimatedDaysMin: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Max Days</label>
              <input type="number" min="1" value={form.estimatedDaysMax}
                onChange={(e) => setForm({ ...form, estimatedDaysMax: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Brand</label>
              <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                {BRAND_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="accent-indigo-600" />
            <span className="text-sm text-gray-700">Active</span>
          </label>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : editingId ? "Update Zone" : "Create Zone"}
            </button>
            <button type="button" onClick={cancelForm}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
        ) : zones.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No shipping zones yet. Create one to get started.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Zone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Governorates</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Price</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Days</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Brand</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-900">{zone.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate hidden md:table-cell">{zone.governorates}</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">{Number(zone.priceOverride).toFixed(0)} EGP</td>
                  <td className="px-4 py-3 text-center text-gray-600 hidden sm:table-cell">{zone.estimatedDaysMin}–{zone.estimatedDaysMax} days</td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{zone.brand}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${zone.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {zone.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(zone)}
                        className="text-xs text-indigo-600 hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(zone.id)} disabled={deleting === zone.id}
                        className="text-xs text-red-500 hover:underline font-medium disabled:opacity-50">
                        {deleting === zone.id ? "..." : "Delete"}
                      </button>
                    </div>
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

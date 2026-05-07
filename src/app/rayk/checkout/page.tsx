"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string; qty: number; unitPrice: number;
  product: { id: string; name: string; slug: string; images: { imageUrl: string }[] };
}

const GOVERNORATES = [
  "Cairo","Giza","Alexandria","Dakahlia","Red Sea","Beheira","Fayoum","Gharbiya",
  "Ismailia","Menofia","Minya","Qaliubiya","New Valley","Suez","Aswan","Assiut",
  "Beni Suef","Port Said","Damietta","Sharkia","South Sinai","Kafr El Sheikh",
  "Matruh","Luxor","Qena","North Sinai","Sohag",
];

export default function RaykCheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState("0");
  const [shippingFee, setShippingFee] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: "", email: "", phone: "", paymentMethod: "cod", notes: "",
    governorate: "", city: "", area: "", addressLine1: "", addressLine2: "",
    building: "", floor: "", apartment: "", landmark: "",
  });

  function setField(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  useEffect(() => {
    fetch("/api/storefront/cart?brand=rayk", { credentials: "include" })
      .then((r) => r.json()).then((d) => {
        setItems(d?.data?.items ?? []);
        setSubtotal(d?.data?.subtotal ?? "0");
      });
    fetch("/api/storefront/shipping", { credentials: "include" })
      .then((r) => r.json()).then((d) => {
        setShippingFee(d?.data?.type === "fixed" ? d.data.amount : 0);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/storefront/orders", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          email: form.email,
          phone: form.phone,
          paymentMethod: form.paymentMethod,
          notes: form.notes || null,
          brand: "rayk",
          address: {
            governorate: form.governorate, city: form.city,
            area: form.area || null, addressLine1: form.addressLine1,
            addressLine2: form.addressLine2 || null, building: form.building || null,
            floor: form.floor || null, apartment: form.apartment || null,
            landmark: form.landmark || null,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new Event("rayk-cart-updated"));
        router.push(`/rayk/track-order?ref=${data.data.orderRef}`);
      } else {
        setError(data.message ?? "Failed to place order");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black tracking-wide bg-white";
  const labelCls = "text-[10px] font-semibold tracking-[0.25em] uppercase text-black/40 mb-1.5 block";

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/20 mb-4">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8">
          {error && (
            <div className="border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>
          )}

          <section className="space-y-4">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/30">Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input required type="text" value={form.customerName} onChange={(e) => setField("customerName", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone *</label>
                <input required type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input required type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} className={inputCls} />
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/30">Delivery Address</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Governorate *</label>
                <select required value={form.governorate} onChange={(e) => setField("governorate", e.target.value)} className={inputCls}>
                  <option value="">Select...</option>
                  {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>City *</label>
                <input required type="text" value={form.city} onChange={(e) => setField("city", e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Street Address *</label>
              <input required type="text" value={form.addressLine1} onChange={(e) => setField("addressLine1", e.target.value)} className={inputCls} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Building</label>
                <input type="text" value={form.building} onChange={(e) => setField("building", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Floor</label>
                <input type="text" value={form.floor} onChange={(e) => setField("floor", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Apartment</label>
                <input type="text" value={form.apartment} onChange={(e) => setField("apartment", e.target.value)} className={inputCls} />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/30">Payment</p>
            <label className={`flex items-center gap-3 border p-4 cursor-pointer transition-colors ${form.paymentMethod === "cod" ? "border-black" : "border-black/10"}`}>
              <input type="radio" name="payment" value="cod" checked={form.paymentMethod === "cod"}
                onChange={() => setField("paymentMethod", "cod")} className="accent-black" />
              <div>
                <p className="text-sm font-semibold tracking-wide">Cash on Delivery</p>
                <p className="text-xs text-black/40">Pay when you receive your order</p>
              </div>
            </label>
          </section>

          <div>
            <label className={labelCls}>Order Notes</label>
            <textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)}
              rows={3} placeholder="Optional instructions..."
              className={inputCls + " resize-none"} />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-black text-white py-4 text-xs font-semibold tracking-widest uppercase hover:bg-black/80 transition-colors disabled:opacity-50"
          >
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="border border-black/5 p-6 space-y-4 sticky top-24">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/30">Order Summary</p>
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-16 bg-gray-50 shrink-0 overflow-hidden">
                  {item.product.images[0] && (
                    <img src={item.product.images[0].imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium tracking-wide truncate">{item.product.name}</p>
                  <p className="text-[10px] text-black/30 tracking-widest uppercase">Qty {item.qty}</p>
                </div>
                <p className="text-xs font-semibold shrink-0">{(Number(item.unitPrice) * item.qty).toFixed(0)} EGP</p>
              </div>
            ))}
            <div className="pt-3 border-t border-black/5 space-y-1.5">
              <div className="flex justify-between text-xs text-black/50 tracking-wide">
                <span>Subtotal</span>
                <span>{subtotal} EGP</span>
              </div>
              <div className="flex justify-between text-xs text-black/50 tracking-wide">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? "Free" : `${shippingFee} EGP`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold tracking-wide pt-1.5 border-t border-black/5">
                <span>Total</span>
                <span>{(Number(subtotal) + shippingFee).toFixed(0)} EGP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

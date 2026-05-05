"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CartItem {
  qty: number;
  unitPrice: number;
  product: { id: string; name: string; slug: string; images?: { imageUrl: string }[] };
}

type PaymentMethod = "cod" | "instapay";

interface FormData {
  customerName: string;
  email: string;
  phone: string;
  notes: string;
  governorate: string;
  city: string;
  area: string;
  addressLine1: string;
  addressLine2: string;
  building: string;
  floor: string;
  apartment: string;
  landmark: string;
}

const EGYPT_GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira", "Fayoum",
  "Gharbia", "Ismailia", "Menofia", "Minya", "Qalyubia", "New Valley", "Suez",
  "Aswan", "Assiut", "Beni Suef", "Port Said", "Damietta", "Sharkia", "South Sinai",
  "Kafr El Sheikh", "Matruh", "Luxor", "Qena", "North Sinai", "Sohag",
];

interface ShippingConfig { type: "fixed" | "discussed"; amount: number }

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipping, setShipping] = useState<ShippingConfig>({ type: "fixed", amount: 0 });

  const [form, setForm] = useState<FormData>({
    customerName: "", email: "", phone: "", notes: "",
    governorate: "", city: "", area: "", addressLine1: "",
    addressLine2: "", building: "", floor: "", apartment: "", landmark: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/storefront/cart", { credentials: "include" }).then((r) => r.json()).then((d) => setItems(d?.data?.items ?? [])),
      fetch("/api/storefront/shipping").then((r) => r.json()).then((d) => { if (d.success) setShipping(d.data); }),
    ]).finally(() => setLoadingCart(false));
  }, []);

  function setField(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice) * item.qty, 0);
  const shippingFeeAmount = shipping.type === "fixed" ? shipping.amount : 0;
  const total = subtotal + shippingFeeAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // For instapay, we still use "cod" as payment method since instapay is manual
    const body = {
      customerName: form.customerName,
      email: form.email,
      phone: form.phone,
      paymentMethod: "cod",
      notes: paymentMethod === "instapay"
        ? `[InstaPay Payment] ${form.notes}`.trim()
        : form.notes || undefined,
      address: {
        governorate: form.governorate,
        city: form.city,
        area: form.area || undefined,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || undefined,
        building: form.building || undefined,
        floor: form.floor || undefined,
        apartment: form.apartment || undefined,
        landmark: form.landmark || undefined,
      },
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/storefront/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new Event("cart-updated"));
        router.push(`/track-order?ref=${data.data.orderRef}`);
      } else {
        setError(data.message || "Failed to place order. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingCart) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-40 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded-xl" />)}</div>
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is empty</h2>
        <Link href="/shop" className="text-indigo-600 hover:underline">Go shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: form */}
        <div className="space-y-6">
          {/* Contact info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              Contact Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Full Name *</label>
                <input
                  required
                  type="text"
                  value={form.customerName}
                  onChange={(e) => setField("customerName", e.target.value)}
                  placeholder="Ahmed Mohamed"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="ahmed@email.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Phone *</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Shipping Address
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Governorate *</label>
                  <select
                    required
                    value={form.governorate}
                    onChange={(e) => setField("governorate", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                  >
                    <option value="">Select...</option>
                    {EGYPT_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">City *</label>
                  <input
                    required
                    type="text"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    placeholder="Nasr City"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Area / District</label>
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => setField("area", e.target.value)}
                  placeholder="e.g. Maadi"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Street Address *</label>
                <input
                  required
                  type="text"
                  value={form.addressLine1}
                  onChange={(e) => setField("addressLine1", e.target.value)}
                  placeholder="15 El Tahrir St."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Building</label>
                  <input type="text" value={form.building} onChange={(e) => setField("building", e.target.value)} placeholder="5"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Floor</label>
                  <input type="text" value={form.floor} onChange={(e) => setField("floor", e.target.value)} placeholder="3"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Apartment</label>
                  <input type="text" value={form.apartment} onChange={(e) => setField("apartment", e.target.value)} placeholder="12"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Landmark (optional)</label>
                <input type="text" value={form.landmark} onChange={(e) => setField("landmark", e.target.value)}
                  placeholder="Near Metro station"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              Payment Method
            </h2>
            <div className="space-y-3">
              {/* COD */}
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                paymentMethod === "cod" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-0.5 accent-indigo-600"
                />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Cash on Delivery</p>
                  <p className="text-xs text-gray-500 mt-0.5">Pay when your order arrives at your door</p>
                </div>
              </label>

              {/* InstaPay */}
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                paymentMethod === "instapay" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="instapay"
                  checked={paymentMethod === "instapay"}
                  onChange={() => setPaymentMethod("instapay")}
                  className="mt-0.5 accent-indigo-600"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">InstaPay</p>
                  <p className="text-xs text-gray-500 mt-0.5">Transfer via InstaPay then contact us to confirm</p>
                  {paymentMethod === "instapay" && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
                      <p className="font-semibold">InstaPay Transfer Details:</p>
                      <p>Account: <strong>3dprintzone@instapay</strong></p>
                      <p>Amount: <strong>{shipping.type === "discussed" ? `${subtotal.toFixed(0)} EGP + shipping TBD` : `${total.toFixed(0)} EGP`}</strong></p>
                      <p className="mt-1 text-amber-700">After payment, send a screenshot to our WhatsApp to confirm your order.</p>
                      <a
                        href="https://wa.me/201012708316"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-green-700 font-medium hover:underline"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp: +201012708316
                      </a>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="text-xs font-medium text-gray-700 mb-1 block">Order Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                rows={2}
                placeholder="Any special instructions for your order..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </div>

        {/* Right: order summary */}
        <div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-28">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {items.map((item, i) => {
                const img = item.product.images?.[0];
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {img?.imageUrl ? (
                        <img src={img.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100" />
                      )}
                      <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                        {item.qty}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{Number(item.unitPrice).toFixed(0)} EGP each</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 shrink-0">
                      {(Number(item.unitPrice) * item.qty).toFixed(0)} EGP
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(0)} EGP</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                {shipping.type === "discussed" ? (
                  <span className="text-amber-600 font-medium text-xs leading-5">To be discussed</span>
                ) : shippingFeeAmount === 0 ? (
                  <span className="text-green-600 font-medium">Free</span>
                ) : (
                  <span>{shippingFeeAmount.toFixed(0)} EGP</span>
                )}
              </div>
              {shipping.type === "discussed" && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1.5">
                  Shipping cost will be confirmed after your order is reviewed.
                </p>
              )}
              <div className="flex justify-between font-bold text-base text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span>
                <span>
                  {shipping.type === "discussed"
                    ? `${subtotal.toFixed(0)} EGP + shipping`
                    : `${total.toFixed(0)} EGP`}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-5 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              By placing your order you agree to our terms
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

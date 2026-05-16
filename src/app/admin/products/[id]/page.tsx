"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductForm, { ProductFormValues } from "@/components/admin/ProductForm";
import ImageManager from "@/components/admin/ImageManager";

interface Product {
  id: string;
  name: string;
  categoryId: string;
  shortDescription: string | null;
  description: string | null;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQty: number;
  lowStockThreshold: number;
  productType: "physical" | "digital" | "service";
  isActive: boolean;
  isFeatured: boolean;
  forceShippingDiscussion: boolean;
  brand: string;
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then((d) => { if (d) setProduct(d?.data ?? null); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-2xl animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
              <div className="space-y-3">
                <div className="h-9 bg-gray-200 rounded" />
                <div className="h-9 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="p-6 sm:p-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 text-red-500 mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-900 mb-1">Product not found</p>
        <p className="text-xs text-gray-500 mb-4">The product may have been removed.</p>
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </Link>
      </div>
    );
  }

  const initialValues: ProductFormValues = {
    name: product.name,
    categoryId: product.categoryId,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    sku: product.sku ?? "",
    price: String(product.price),
    compareAtPrice: product.compareAtPrice != null ? String(product.compareAtPrice) : "",
    stockQty: String(product.stockQty),
    lowStockThreshold: String(product.lowStockThreshold),
    productType: product.productType,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    forceShippingDiscussion: product.forceShippingDiscussion,
    brand: product.brand ?? "3dprintzone",
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors press"
          aria-label="Back to products"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-500 truncate max-w-xs">{product.name}</p>
        </div>
      </div>

      <ProductForm
        mode="edit"
        productId={product.id}
        initialValues={initialValues}
      />

      <ImageManager productId={product.id} />
    </div>
  );
}

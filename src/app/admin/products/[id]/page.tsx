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
      <div className="p-6 space-y-5 max-w-2xl animate-pulse">
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
      <div className="p-6 text-center">
        <p className="text-gray-500">Product not found.</p>
        <Link href="/admin/products" className="text-indigo-600 hover:underline text-sm mt-2 block">← Back to Products</Link>
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
  };

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
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

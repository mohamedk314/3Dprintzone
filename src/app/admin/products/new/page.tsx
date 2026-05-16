import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
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
        <div>
          <h1 className="text-xl font-bold text-gray-900">New Product</h1>
          <p className="text-sm text-gray-500">Add a new product to your store.</p>
        </div>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

export default function ImageManager({ productId }: { productId: string }) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/admin/products/${productId}/images`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setImages(d.data); })
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      // Upload file through server-side route (avoids R2 CORS)
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch("/api/uploads/r2/upload", {
        method: "POST",
        body: form,
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error(uploadData.message || "Upload failed");

      const saveRes = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadData.imageUrl,
          contentType: file.type,
          isPrimary: images.length === 0,
          sortOrder: images.length,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveData.success) throw new Error(saveData.message || "Failed to save image");

      setImages((prev) => [...prev, saveData.data]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSetPrimary(imageId: string) {
    setSettingPrimaryId(imageId);
    try {
      const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      const data = await res.json();
      if (data.success) {
        setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imageId })));
      } else {
        setUploadError(data.message || "Failed to set primary");
      }
    } finally {
      setSettingPrimaryId(null);
    }
  }

  async function handleDelete(imageId: string) {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    setDeletingId(imageId);
    try {
      const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setImages((prev) => {
          const remaining = prev.filter((img) => img.id !== imageId);
          const deletedWasPrimary = prev.find((img) => img.id === imageId)?.isPrimary;
          if (deletedWasPrimary && remaining.length > 0) {
            return remaining.map((img, i) => i === 0 ? { ...img, isPrimary: true } : img);
          }
          return remaining;
        });
      } else {
        setUploadError(data.message || "Failed to delete image");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-900 text-sm">Product Images</h2>
          <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, WebP only. First image is primary by default.</p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Image
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_ACCEPT}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {uploadError && (
        <div className="mb-4 text-xs bg-red-50 border border-red-100 text-red-600 rounded-lg px-3 py-2">
          {uploadError}
        </div>
      )}

      {loading ? (
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-24 h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs text-gray-400">No images yet. Click &ldquo;Add Image&rdquo; to upload.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className={`relative group w-24 h-24 rounded-lg overflow-hidden border-2 transition-colors ${img.isPrimary ? "border-indigo-500" : "border-gray-200"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.imageUrl}
                alt={img.altText ?? ""}
                className="w-full h-full object-cover"
              />

              {/* Primary badge */}
              {img.isPrimary && (
                <span className="absolute top-0 left-0 right-0 bg-indigo-600/90 text-white text-[9px] font-semibold text-center py-0.5">
                  PRIMARY
                </span>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.id)}
                    disabled={settingPrimaryId === img.id}
                    title="Set as primary"
                    className="w-full text-[10px] font-semibold bg-white/90 text-gray-800 rounded px-1 py-1 hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {settingPrimaryId === img.id ? "..." : "Set Primary"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  disabled={deletingId === img.id}
                  title="Delete image"
                  className="w-full text-[10px] font-semibold bg-red-500/90 text-white rounded px-1 py-1 hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deletingId === img.id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

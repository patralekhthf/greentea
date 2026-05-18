"use client";

import { useEffect, useRef, useState } from "react";
import { buildImageUrl } from "@/lib/cloudinary-url";

type CountryCode = "IN" | "US" | "GB" | "AU";

const COUNTRIES: { code: CountryCode; label: string; flag: string }[] = [
  { code: "IN", label: "India",     flag: "🇮🇳" },
  { code: "US", label: "USA",       flag: "🇺🇸" },
  { code: "GB", label: "UK",        flag: "🇬🇧" },
  { code: "AU", label: "Australia", flag: "🇦🇺" },
];

type Banner = {
  id: string;
  countryCode: string | null;
  imageUrl: string;
  isActive: boolean;
};

export default function HeroImagesClient() {
  const [banners, setBanners] = useState<Record<string, Banner | undefined>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingFor, setUploadingFor] = useState<CountryCode | null>(null);
  const [error, setError] = useState("");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hero-banners");
      if (!res.ok) throw new Error("Failed to load");
      const data: Banner[] = await res.json();
      const byCountry: Record<string, Banner> = {};
      for (const b of data) {
        if (b.countryCode) byCountry[b.countryCode] = b;
      }
      setBanners(byCountry);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(countryCode: CountryCode, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFor(countryCode);
    setError("");
    try {
      // 1) Upload to Cloudinary via existing admin upload route
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "gt/hero");
      const upRes = await fetch("/api/admin/upload", { method: "POST", body: form });
      if (!upRes.ok) throw new Error("Upload failed");
      const { publicId } = await upRes.json();

      // 2) Save the publicId to the Banner row for this country
      const saveRes = await fetch("/api/admin/hero-banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode, imageUrl: publicId }),
      });
      if (!saveRes.ok) throw new Error("Save failed");
      const saved: Banner = await saveRes.json();
      setBanners((prev) => ({ ...prev, [countryCode]: saved }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingFor(null);
      const ref = fileRefs.current[countryCode];
      if (ref) ref.value = "";
    }
  }

  async function handleRemove(countryCode: CountryCode) {
    if (!confirm(`Remove hero image for ${countryCode}?`)) return;
    setError("");
    try {
      const res = await fetch("/api/admin/hero-banners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setBanners((prev) => { const next = { ...prev }; delete next[countryCode]; return next; });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Hero Images</h1>
      <p className="text-sm text-gray-500 mb-2">
        Upload one hero image per country. Shown on the home page hero based on the visitor&apos;s detected country.
      </p>
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 max-w-2xl">
        <p className="font-semibold mb-1">📐 Recommended specs</p>
        <ul className="space-y-1 text-xs leading-relaxed">
          <li>• <strong>Portrait</strong> orientation — <strong>1200 × 1500 px</strong> (4:5 aspect ratio)</li>
          <li>• JPG or PNG, under <strong>500 KB</strong></li>
          <li>• Keep the focal subject in the <strong>center-vertical band</strong> — the image is cropped to fill a portrait card on the home page</li>
          <li>• Any landscape image will get its left/right edges cropped — see the preview below before publishing</li>
        </ul>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {COUNTRIES.map((c) => {
            const banner = banners[c.code];
            const isUploading = uploadingFor === c.code;
            return (
              <div key={c.code} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{c.flag}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{c.label}</h3>
                    <p className="text-xs text-gray-400">Country code: {c.code}</p>
                  </div>
                </div>

                {/* Preview — same crop ratio + Cloudinary transform the home page uses */}
                {banner ? (
                  <div className="mb-3">
                    <div className="w-full max-w-xs mx-auto aspect-[4/5] rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={buildImageUrl(banner.imageUrl, "w_800,h_1000,c_fill,f_webp,q_auto")}
                        alt={`Hero for ${c.label}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-1.5">
                      Live preview — this is exactly how the home page will show it.
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={() => handleRemove(c.code)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                      <span className="text-xs text-gray-400 font-mono truncate ml-2 max-w-[60%]" title={banner.imageUrl}>
                        {banner.imageUrl.split("/").pop()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 w-full max-w-xs mx-auto aspect-[4/5] rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-sm text-center px-4">
                    No image yet<br/>(decorative fallback will show)
                  </div>
                )}

                {/* Upload button */}
                <label className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-colors w-full justify-center ${
                  isUploading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-brand-green text-white hover:bg-brand-mid"
                }`}>
                  {isUploading ? "Uploading…" : banner ? "Replace Image" : "Upload Image"}
                  <input
                    ref={(el) => { fileRefs.current[c.code] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => handleUpload(c.code, e)}
                  />
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

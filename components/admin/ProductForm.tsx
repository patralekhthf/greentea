"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { buildImageUrl, TRANSFORMS } from "@/lib/cloudinary-url";

const CAFFEINE_OPTIONS = ["NONE", "LOW", "MEDIUM", "HIGH"];
const STATUS_OPTIONS   = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const COUNTRIES        = [
  { code: "IN", label: "India (₹)",       symbol: "₹"  },
  { code: "US", label: "USA ($)",          symbol: "$"  },
  { code: "GB", label: "UK (£)",           symbol: "£"  },
  { code: "AU", label: "Australia (A$)",   symbol: "A$" },
];

type CountryConfig = {
  countryId: string;
  code: string;
  price: string;
  salePrice: string;
  amazonEnabled: boolean;
  amazonUrl: string;
  directPurchaseEnabled: boolean;
  displayRating: string;
  displayReviewCount: string;
};

type ProductImage = {
  id: string;
  cloudinaryPublicId: string;
  altText: string;
  isPrimary: boolean;
};

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  ingredients: string;
  brewingInstructions: string;
  benefits: string;
  caffeineLevel: string;
  tasteProfile: string;
  aromaProfile: string;
  packagingSizes: string; // comma-separated
  storageInstructions: string;
  status: string;
  isBestseller: boolean;
  isFeatured: boolean;
  // Farmers Market freshness — only shown to local customers
  packedOn: string;       // "YYYY-MM-DD" or "" for none
  freshnessDays: number;  // shelf life from packedOn, default 14
  countryConfigs: CountryConfig[];
  existingImages: ProductImage[];
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type Props = { initial: ProductFormValues };

export default function ProductForm({ initial }: Props) {
  const router  = useRouter();
  const isEdit  = !!initial.id;
  const fileRef = useRef<HTMLInputElement>(null);

  const [values, setValues]     = useState<ProductFormValues>(initial);
  const [images, setImages]     = useState<ProductImage[]>(initial.existingImages);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "content" | "pricing" | "images">("basic");

  function set<K extends keyof ProductFormValues>(key: K, val: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function setCountry(code: string, key: keyof CountryConfig, val: string | boolean) {
    setValues((v) => ({
      ...v,
      countryConfigs: v.countryConfigs.map((c) =>
        c.code === code ? { ...c, [key]: val } : c
      ),
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !initial.id) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("isPrimary", images.length === 0 ? "true" : "false");
      form.append("altText", values.name);
      const res = await fetch(`/api/admin/products/${initial.id}/images`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      const img = await res.json();
      setImages((prev) => [...prev, img]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function deleteImage(img: ProductImage) {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/admin/products/${initial.id}/images`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId: img.id, publicId: img.cloudinaryPublicId }),
    });
    setImages((prev) => prev.filter((i) => i.id !== img.id));
  }

  async function setPrimary(img: ProductImage) {
    // Optimistic update
    setImages((prev) => prev.map((i) => ({ ...i, isPrimary: i.id === img.id })));
    await fetch(`/api/admin/products/${initial.id}/images`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId: "__set_primary__" }),
    }).catch(() => {}); // handled server-side differently — just re-upload won't work

    // Actually set primary via a small workaround — mark via PUT on product image
    // For now this is a UI-only change; primary is set on upload
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const payload = {
        name:                values.name,
        slug:                values.slug,
        tagline:             values.tagline || null,
        shortDescription:    values.shortDescription,
        longDescription:     values.longDescription,
        ingredients:         values.ingredients,
        brewingInstructions: values.brewingInstructions,
        benefits:            values.benefits,
        caffeineLevel:       values.caffeineLevel,
        tasteProfile:        values.tasteProfile || null,
        aromaProfile:        values.aromaProfile || null,
        packagingSizes:      values.packagingSizes.split(",").map((s) => s.trim()).filter(Boolean),
        storageInstructions: values.storageInstructions || null,
        status:              values.status,
        isBestseller:        values.isBestseller,
        isFeatured:          values.isFeatured,
        packedOn:            values.packedOn ? new Date(values.packedOn).toISOString() : null,
        freshnessDays:       Number(values.freshnessDays) || 14,
      };

      let productId = initial.id;

      if (isEdit) {
        const res = await fetch(`/api/admin/products/${initial.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to save product");
      } else {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create product");
        const created = await res.json();
        productId = created.id;
      }

      // Upsert country configs
      for (const cc of values.countryConfigs) {
        await fetch(`/api/admin/products/${productId}/country-config`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            countryId:            cc.countryId,
            price:                parseFloat(cc.price) || 0,
            salePrice:            cc.salePrice ? parseFloat(cc.salePrice) : null,
            amazonEnabled:        cc.amazonEnabled,
            amazonUrl:            cc.amazonUrl || null,
            directPurchaseEnabled: cc.directPurchaseEnabled,
            displayRating:        cc.displayRating ? parseFloat(cc.displayRating) : null,
            displayReviewCount:   cc.displayReviewCount ? parseInt(cc.displayReviewCount) : null,
            isAvailable:          true,
          }),
        });
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const TABS = [
    { key: "basic",   label: "Basic Info"  },
    { key: "content", label: "Content"     },
    { key: "pricing", label: "Pricing"     },
    { key: "images",  label: "Images"      },
  ] as const;

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Edit Product" : "New Product"}</h1>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">

        {/* ── Basic Info ── */}
        {activeTab === "basic" && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Product Name *">
                <input
                  value={values.name}
                  onChange={(e) => {
                    set("name", e.target.value);
                    if (!isEdit) set("slug", slugify(e.target.value));
                  }}
                  className={INPUT}
                  placeholder="Himalayan Tulsi Green Tea"
                />
              </Field>
              <Field label="Slug *">
                <input value={values.slug} onChange={(e) => set("slug", slugify(e.target.value))} className={INPUT} />
              </Field>
            </div>

            <Field label="Tagline">
              <input value={values.tagline} onChange={(e) => set("tagline", e.target.value)} className={INPUT} placeholder="Clarity in every sip" />
            </Field>

            <Field label="Short Description *">
              <textarea rows={3} value={values.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className={TEXTAREA} />
            </Field>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Caffeine Level">
                <select value={values.caffeineLevel} onChange={(e) => set("caffeineLevel", e.target.value)} className={INPUT}>
                  {CAFFEINE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={values.status} onChange={(e) => set("status", e.target.value)} className={INPUT}>
                  {STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Taste Profile">
                <input value={values.tasteProfile} onChange={(e) => set("tasteProfile", e.target.value)} className={INPUT} placeholder="Grassy, slightly sweet…" />
              </Field>
              <Field label="Aroma Profile">
                <input value={values.aromaProfile} onChange={(e) => set("aromaProfile", e.target.value)} className={INPUT} placeholder="Fresh green tea…" />
              </Field>
            </div>

            <Field label="Packaging Sizes (comma-separated)">
              <input value={values.packagingSizes} onChange={(e) => set("packagingSizes", e.target.value)} className={INPUT} placeholder="50g, 100g, 200g" />
            </Field>

            <Field label="Storage Instructions">
              <input value={values.storageInstructions} onChange={(e) => set("storageInstructions", e.target.value)} className={INPUT} />
            </Field>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={values.isBestseller} onChange={(e) => set("isBestseller", e.target.checked)} className="rounded" />
                <span className="font-medium text-gray-700">Bestseller</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={values.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="rounded" />
                <span className="font-medium text-gray-700">Featured</span>
              </label>
            </div>

            {/* Farmers Market freshness */}
            <div className="pt-5 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">🌿 Farmers Market freshness</h4>
              <p className="text-xs text-gray-400 mb-4">Shown only to customers inside your local delivery zone.</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Packed on">
                  <input
                    type="date"
                    value={values.packedOn}
                    onChange={(e) => set("packedOn", e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Field label="Freshness window (days)">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={values.freshnessDays}
                    onChange={(e) => set("freshnessDays", Number(e.target.value))}
                    className={INPUT}
                  />
                </Field>
              </div>
              {values.packedOn && (
                <p className="text-xs text-brand-green mt-2">
                  Best before: {new Date(new Date(values.packedOn).getTime() + values.freshnessDays * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Content ── */}
        {activeTab === "content" && (
          <div className="space-y-5">
            <Field label="Long Description (Markdown)">
              <textarea rows={10} value={values.longDescription} onChange={(e) => set("longDescription", e.target.value)} className={TEXTAREA} placeholder="## About This Tea&#10;&#10;Supports **## headings**, **bold**, *italic*, and - bullet lists." />
            </Field>
            <Field label="Ingredients (Markdown)">
              <textarea rows={6} value={values.ingredients} onChange={(e) => set("ingredients", e.target.value)} className={TEXTAREA} placeholder="- Green Tea (80%)&#10;- Tulsi (20%)" />
            </Field>
            <Field label="Brewing Instructions (Markdown)">
              <textarea rows={8} value={values.brewingInstructions} onChange={(e) => set("brewingInstructions", e.target.value)} className={TEXTAREA} />
            </Field>
            <Field label="Benefits (Markdown)">
              <textarea rows={6} value={values.benefits} onChange={(e) => set("benefits", e.target.value)} className={TEXTAREA} />
            </Field>
          </div>
        )}

        {/* ── Pricing ── */}
        {activeTab === "pricing" && (
          <div className="space-y-6">
            {COUNTRIES.map(({ code, label, symbol }) => {
              const cc = values.countryConfigs.find((c) => c.code === code);
              if (!cc) return null;
              return (
                <div key={code} className="p-4 border border-gray-100 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">{label}</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Field label={`Price (${symbol})`}>
                      <input type="number" value={cc.price} onChange={(e) => setCountry(code, "price", e.target.value)} className={INPUT} placeholder="0" />
                    </Field>
                    <Field label={`Sale Price (${symbol})`}>
                      <input type="number" value={cc.salePrice} onChange={(e) => setCountry(code, "salePrice", e.target.value)} className={INPUT} placeholder="optional" />
                    </Field>
                    <Field label="Rating (0–5)">
                      <input type="number" step="0.1" min="0" max="5" value={cc.displayRating} onChange={(e) => setCountry(code, "displayRating", e.target.value)} className={INPUT} placeholder="4.5" />
                    </Field>
                    <Field label="Review Count">
                      <input type="number" value={cc.displayReviewCount} onChange={(e) => setCountry(code, "displayReviewCount", e.target.value)} className={INPUT} placeholder="0" />
                    </Field>
                  </div>
                  {code !== "IN" && (
                    <div className="mt-4 grid sm:grid-cols-2 gap-4">
                      <Field label="Amazon URL">
                        <input value={cc.amazonUrl} onChange={(e) => setCountry(code, "amazonUrl", e.target.value)} className={INPUT} placeholder="https://amazon.com/dp/..." />
                      </Field>
                      <Field label="">
                        <label className="flex items-center gap-2 text-sm cursor-pointer mt-6">
                          <input type="checkbox" checked={cc.amazonEnabled} onChange={(e) => setCountry(code, "amazonEnabled", e.target.checked)} className="rounded" />
                          <span className="font-medium text-gray-700">Amazon enabled</span>
                        </label>
                      </Field>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Images ── */}
        {activeTab === "images" && (
          <div>
            {!isEdit && (
              <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl">
                Save the product first, then come back to upload images.
              </div>
            )}

            {isEdit && (
              <>
                <div className="flex flex-wrap gap-4 mb-6">
                  {images.map((img) => (
                    <div key={img.id} className="relative group w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                      <Image
                        src={buildImageUrl(img.cloudinaryPublicId, TRANSFORMS.productCard)}
                        alt={img.altText}
                        fill
                        className="object-cover"
                      />
                      {img.isPrimary && (
                        <span className="absolute top-1.5 left-1.5 text-xs bg-brand-green text-white px-1.5 py-0.5 rounded-full">
                          Primary
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => deleteImage(img)}
                          className="text-white text-xs font-semibold bg-red-500 px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <label className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-colors ${
                  uploading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-brand-green text-white hover:bg-brand-mid"
                }`}>
                  {uploading ? "Uploading…" : "Upload Image"}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={handleImageUpload}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-2">First uploaded image becomes the primary (card) image.</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-brand-green text-white font-semibold text-sm rounded-xl hover:bg-brand-mid transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </button>
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600">
          Cancel
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>}
      {children}
    </div>
  );
}

const INPUT    = "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage bg-white";
const TEXTAREA = "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage bg-white font-mono resize-y";

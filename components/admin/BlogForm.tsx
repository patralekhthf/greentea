"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { buildImageUrl } from "@/lib/cloudinary-url";

const STATUS_OPTIONS = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export type BlogFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImagePublicId: string;
  metaTitle: string;
  metaDescription: string;
  status: string;
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const INPUT    = "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage bg-white";
const TEXTAREA = "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage bg-white font-mono resize-y";

export default function BlogForm({ initial }: { initial: BlogFormValues }) {
  const router = useRouter();
  const isEdit = !!initial.id;
  const fileRef = useRef<HTMLInputElement>(null);

  const [values, setValues]     = useState<BlogFormValues>(initial);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  function set<K extends keyof BlogFormValues>(key: K, val: BlogFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "gt/blogs");
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const { publicId } = await res.json();
      set("coverImagePublicId", publicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const payload = {
        title:           values.title,
        slug:            values.slug,
        excerpt:         values.excerpt || null,
        content:         values.content,
        coverImageUrl:   values.coverImagePublicId || null,
        metaTitle:       values.metaTitle || null,
        metaDescription: values.metaDescription || null,
        status:          values.status,
        publishedAt:     values.status === "PUBLISHED" ? new Date().toISOString() : null,
      };

      const url    = isEdit ? `/api/admin/blog/${initial.id}` : "/api/admin/blog";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save post");

      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initial.id) return;
    if (!confirm("Delete this post permanently?")) return;
    await fetch(`/api/admin/blog/${initial.id}`, { method: "DELETE" });
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Edit Post" : "New Blog Post"}</h1>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content — left 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            <div>
              <label className={LABEL}>Title *</label>
              <input
                value={values.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!isEdit) set("slug", slugify(e.target.value));
                }}
                className={INPUT}
                placeholder="5 Ayurvedic Teas for Better Sleep"
              />
            </div>
            <div>
              <label className={LABEL}>Slug *</label>
              <input value={values.slug} onChange={(e) => set("slug", slugify(e.target.value))} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Excerpt</label>
              <textarea rows={2} value={values.excerpt} onChange={(e) => set("excerpt", e.target.value)} className={TEXTAREA} placeholder="Short summary shown on blog list page…" />
            </div>
            <div>
              <label className={LABEL}>Content (Markdown) *</label>
              <textarea
                rows={20}
                value={values.content}
                onChange={(e) => set("content", e.target.value)}
                className={TEXTAREA}
                placeholder={"## Introduction\n\nYour article content goes here…\n\nSupports **bold**, *italic*, ## headings, and - lists."}
              />
              <p className="text-xs text-gray-400 mt-1">Markdown is rendered on the public blog page.</p>
            </div>
          </div>
        </div>

        {/* Sidebar — right 1/3 */}
        <div className="space-y-5">
          {/* Publish settings */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Publish</h3>
            <div className="mb-4">
              <label className={LABEL}>Status</label>
              <select value={values.status} onChange={(e) => set("status", e.target.value)} className={INPUT}>
                {STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-xl hover:bg-brand-mid transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : isEdit ? "Save" : "Create"}
              </button>
              {isEdit && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Cover image */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Cover Image</h3>
            {values.coverImagePublicId ? (
              <div className="mb-3">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-100">
                  <Image
                    src={buildImageUrl(values.coverImagePublicId, "w_600,h_338,c_fill,f_webp,q_auto")}
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  onClick={() => set("coverImagePublicId", "")}
                  className="mt-2 text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="mb-3 w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-sm">
                No cover image
              </div>
            )}
            <label className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-colors ${
              uploading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
              {uploading ? "Uploading…" : "Upload Image"}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleCoverUpload} />
            </label>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">SEO</h3>
            <div className="space-y-4">
              <div>
                <label className={LABEL}>Meta Title</label>
                <input value={values.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} className={INPUT} placeholder="Defaults to post title" />
              </div>
              <div>
                <label className={LABEL}>Meta Description</label>
                <textarea rows={3} value={values.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} className={TEXTAREA} placeholder="160 chars max" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const LABEL = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

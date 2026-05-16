import type { Metadata } from "next";
import BlogForm, { type BlogFormValues } from "@/components/admin/BlogForm";

export const metadata: Metadata = { title: "New Blog Post" };

export default function NewBlogPage() {
  const initial: BlogFormValues = {
    title: "", slug: "", excerpt: "", content: "",
    coverImagePublicId: "", metaTitle: "", metaDescription: "", status: "DRAFT",
  };
  return <BlogForm initial={initial} />;
}

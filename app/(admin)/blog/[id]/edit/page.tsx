import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import BlogForm, { type BlogFormValues } from "@/components/admin/BlogForm";

export const metadata: Metadata = { title: "Edit Post" };

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;
  const post = await db.blog.findUnique({ where: { id } });
  if (!post) notFound();

  const initial: BlogFormValues = {
    id:                 post.id,
    title:              post.title,
    slug:               post.slug,
    excerpt:            post.excerpt ?? "",
    content:            post.content,
    coverImagePublicId: post.coverImageUrl ?? "",
    metaTitle:          post.metaTitle ?? "",
    metaDescription:    post.metaDescription ?? "",
    status:             post.status,
  };

  return <BlogForm initial={initial} />;
}

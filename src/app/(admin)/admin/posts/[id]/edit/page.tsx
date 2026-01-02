"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PostForm } from "@/components/forms/post-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  contentJson: object | null;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  categoryId: string | null;
  status: string;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
}

export default function EditPostPage() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${params.id}`);
        if (!res.ok) {
          throw new Error("Post not found");
        }
        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full mt-4" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Post not found</h2>
          <p className="text-muted-foreground">{error || "The post you're looking for doesn't exist."}</p>
        </div>
      </div>
    );
  }

  return (
    <PostForm
      initialData={{
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || undefined,
        content: post.content,
        contentJson: post.contentJson || undefined,
        featuredImage: post.featuredImage || undefined,
        featuredImageAlt: post.featuredImageAlt || undefined,
        categoryId: post.categoryId || undefined,
        status: post.status,
        metaTitle: post.metaTitle || undefined,
        metaDescription: post.metaDescription || undefined,
        keywords: post.keywords,
      }}
    />
  );
}

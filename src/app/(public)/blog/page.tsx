import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { PostCard, PostCardSkeleton } from "@/components/blog/post-card";
import { ContentWithSidebar } from "@/components/layout/content-with-sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Explore our latest articles on nutrition, fitness, healthy recipes, and wellness tips for women.",
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { posts: { where: { status: "PUBLISHED" } } },
      },
    },
  });
}

async function getPosts(page: number, categorySlug?: string) {
  const limit = 9;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        category: {
          select: { name: true, slug: true, color: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const categorySlug = params.category;

  const [{ posts, pagination }, categories] = await Promise.all([
    getPosts(page, categorySlug),
    getCategories(),
  ]);

  const currentCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null;

  return (
    <ContentWithSidebar
      sidebarContent={
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/blog">
              <Badge
                variant={!categorySlug ? "default" : "outline"}
                className="cursor-pointer"
              >
                All Posts
              </Badge>
            </Link>
            {categories.map((category) => (
              <Link key={category.id} href={`/blog?category=${category.slug}`}>
                <Badge
                  variant={categorySlug === category.slug ? "default" : "outline"}
                  className="cursor-pointer"
                  style={{
                    borderColor:
                      categorySlug !== category.slug ? (category.color || undefined) : undefined,
                  }}
                >
                  {category.name} ({category._count.posts})
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      }
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-poppins mb-2">
          {currentCategory ? currentCategory.name : "Blog"}
        </h1>
        <p className="text-muted-foreground">
          {currentCategory
            ? currentCategory.description ||
              `Browse our ${currentCategory.name.toLowerCase()} articles`
            : "Discover tips, recipes, and insights for a healthier lifestyle"}
        </p>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts found.</p>
          {categorySlug && (
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/blog">View all posts</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Featured Post */}
          {page === 1 && posts.length > 0 && (
            <div className="mb-8">
              <PostCard post={posts[0]} featured />
            </div>
          )}

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(page === 1 ? posts.slice(1) : posts).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <Button variant="outline" asChild>
                  <Link
                    href={`/blog?page=${page - 1}${
                      categorySlug ? `&category=${categorySlug}` : ""
                    }`}
                  >
                    Previous
                  </Link>
                </Button>
              )}
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </span>
              {page < pagination.totalPages && (
                <Button variant="outline" asChild>
                  <Link
                    href={`/blog?page=${page + 1}${
                      categorySlug ? `&category=${categorySlug}` : ""
                    }`}
                  >
                    Next
                  </Link>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </ContentWithSidebar>
  );
}

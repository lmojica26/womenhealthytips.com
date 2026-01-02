import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ContentWithSidebar } from "@/components/layout/content-with-sidebar";
import { VideoCard } from "@/components/videos/video-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Wellness Videos",
  description:
    "Watch our collection of wellness videos covering fitness, nutrition, yoga, and healthy living tips.",
};

interface VideosPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { videos: { where: { status: "PUBLISHED" } } },
      },
    },
  });
}

async function getVideos(page: number, categorySlug?: string) {
  const limit = 9;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
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
    prisma.video.count({ where }),
  ]);

  return {
    videos,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const categorySlug = params.category;

  const [{ videos, pagination }, categories] = await Promise.all([
    getVideos(page, categorySlug),
    getCategories(),
  ]);

  const currentCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null;

  // Filter categories that have videos
  const categoriesWithVideos = categories.filter((c) => c._count.videos > 0);

  return (
    <ContentWithSidebar
      sidebarContent={
        categoriesWithVideos.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/videos">
                <Badge
                  variant={!categorySlug ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  All Videos
                </Badge>
              </Link>
              {categoriesWithVideos.map((category) => (
                <Link key={category.id} href={`/videos?category=${category.slug}`}>
                  <Badge
                    variant={categorySlug === category.slug ? "default" : "outline"}
                    className="cursor-pointer"
                    style={{
                      borderColor:
                        categorySlug !== category.slug ? (category.color || undefined) : undefined,
                    }}
                  >
                    {category.name} ({category._count.videos})
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : undefined
      }
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-poppins mb-2">
          {currentCategory ? currentCategory.name : "Wellness Videos"}
        </h1>
        <p className="text-muted-foreground">
          {currentCategory
            ? currentCategory.description ||
              `Browse our ${currentCategory.name.toLowerCase()} videos`
            : "Inspiring videos for your health and wellness journey"}
        </p>
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No videos found.</p>
          {categorySlug && (
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/videos">View all videos</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Featured Video */}
          {page === 1 && videos.length > 0 && (
            <div className="mb-8">
              <VideoCard video={videos[0]} featured />
            </div>
          )}

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(page === 1 ? videos.slice(1) : videos).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <Button variant="outline" asChild>
                  <Link
                    href={`/videos?page=${page - 1}${
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
                    href={`/videos?page=${page + 1}${
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

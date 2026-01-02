import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import prisma from "@/lib/prisma";
import { ContentWithSidebar } from "@/components/layout/content-with-sidebar";
import { VideoJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  Eye,
  Calendar,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  ChevronRight,
  Play,
} from "lucide-react";

interface VideoPageProps {
  params: Promise<{ slug: string }>;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return null;
}

async function getVideo(slug: string) {
  const video = await prisma.video.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: {
        select: { id: true, name: true, slug: true, color: true },
      },
      tags: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (video) {
    // Increment view count
    await prisma.video.update({
      where: { id: video.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return video;
}

async function getRelatedVideos(videoId: string, categoryId: string | null) {
  return prisma.video.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: videoId },
      ...(categoryId && { categoryId }),
    },
    include: {
      category: {
        select: { name: true, slug: true, color: true },
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 4,
  });
}

export async function generateMetadata({
  params,
}: VideoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = await prisma.video.findUnique({
    where: { slug, status: "PUBLISHED" },
  });

  if (!video) {
    return { title: "Video Not Found" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://womenhealthytips.com";

  return {
    title: video.metaTitle || video.title,
    description: video.metaDescription || video.excerpt || undefined,
    keywords: video.keywords,
    openGraph: {
      title: video.metaTitle || video.title,
      description: video.metaDescription || video.excerpt || undefined,
      type: "video.other",
      videos: video.youtubeUrl ? [{ url: video.youtubeUrl }] : undefined,
      images: video.thumbnailUrl
        ? [{ url: video.thumbnailUrl, alt: video.title }]
        : undefined,
      url: `${siteUrl}/videos/${video.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: video.metaTitle || video.title,
      description: video.metaDescription || video.excerpt || undefined,
      images: video.thumbnailUrl ? [video.thumbnailUrl] : undefined,
    },
    alternates: {
      canonical: video.canonicalUrl || `${siteUrl}/videos/${video.slug}`,
    },
  };
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { slug } = await params;
  const video = await getVideo(slug);

  if (!video) {
    notFound();
  }

  const relatedVideos = await getRelatedVideos(video.id, video.categoryId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://womenhealthytips.com";
  const videoUrl = `${siteUrl}/videos/${video.slug}`;
  const embedUrl = video.youtubeUrl ? getYouTubeEmbedUrl(video.youtubeUrl) : null;

  return (
    <>
      {/* JSON-LD */}
      <VideoJsonLd
        name={video.title}
        description={video.metaDescription || video.excerpt || ""}
        thumbnailUrl={video.thumbnailUrl || undefined}
        uploadDate={video.publishedAt?.toISOString() || video.createdAt.toISOString()}
        duration={video.duration || undefined}
        embedUrl={embedUrl || video.youtubeUrl || ""}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteUrl },
          { name: "Videos", url: `${siteUrl}/videos` },
          ...(video.category
            ? [
                {
                  name: video.category.name,
                  url: `${siteUrl}/videos?category=${video.category.slug}`,
                },
              ]
            : []),
          { name: video.title, url: videoUrl },
        ]}
      />

      <ContentWithSidebar
        sidebarContent={
          <>
            {/* Share Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(video.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(videoUrl)}&title=${encodeURIComponent(video.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Related Videos */}
            {relatedVideos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">More Videos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedVideos.map((relatedVideo) => (
                    <Link
                      key={relatedVideo.id}
                      href={`/videos/${relatedVideo.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-muted relative">
                          {relatedVideo.thumbnailUrl ? (
                            <img
                              src={relatedVideo.thumbnailUrl}
                              alt={relatedVideo.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          {relatedVideo.duration && (
                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                              {formatDuration(relatedVideo.duration)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {relatedVideo.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {relatedVideo.viewCount} views
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        }
      >
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/videos" className="hover:text-primary">
            Videos
          </Link>
          {video.category && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link
                href={`/videos?category=${video.category.slug}`}
                className="hover:text-primary"
              >
                {video.category.name}
              </Link>
            </>
          )}
        </nav>

        {/* Video Player */}
        <div className="mb-6">
          {embedUrl ? (
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={embedUrl}
                title={video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : video.thumbnailUrl ? (
            <div className="aspect-video rounded-xl overflow-hidden bg-muted relative">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                  <Play className="h-10 w-10 text-white fill-white ml-1" />
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
              <Play className="h-20 w-20 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Video Info */}
        <article>
          <header className="mb-8">
            {video.category && (
              <Badge
                className="mb-4"
                style={{ backgroundColor: video.category.color || undefined }}
              >
                {video.category.name}
              </Badge>
            )}
            <h1 className="text-2xl md:text-3xl font-bold font-poppins mb-4">
              {video.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {video.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(video.publishedAt), "MMMM d, yyyy")}
                </span>
              )}
              {video.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(video.duration)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {video.viewCount} views
              </span>
            </div>
          </header>

          {/* Description */}
          {video.excerpt && (
            <div className="mb-8">
              <p className="text-lg text-muted-foreground">{video.excerpt}</p>
            </div>
          )}

          {/* Content */}
          {video.content && (
            <div
              className="prose prose-lg max-w-none prose-headings:font-poppins prose-a:text-primary prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: video.content }}
            />
          )}

          {/* Tags */}
          {video.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Back Button */}
        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link href="/videos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Videos
            </Link>
          </Button>
        </div>
      </ContentWithSidebar>
    </>
  );
}

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import prisma from "@/lib/prisma";
import { ContentWithSidebar } from "@/components/layout/content-with-sidebar";
import { PostCard } from "@/components/blog/post-card";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
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

  if (post) {
    // Increment view count
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return post;
}

async function getRelatedPosts(postId: string, categoryId: string | null) {
  return prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: postId },
      ...(categoryId && { categoryId }),
    },
    include: {
      category: {
        select: { name: true, slug: true, color: true },
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
  });

  if (!post) {
    return { title: "Post Not Found" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://womenhealthytips.com";

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    keywords: post.keywords,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: post.featuredImage
        ? [{ url: post.featuredImage, alt: post.featuredImageAlt || post.title }]
        : undefined,
      url: `${siteUrl}/blog/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || undefined,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
    alternates: {
      canonical: post.canonicalUrl || `${siteUrl}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.id, post.categoryId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://womenhealthytips.com";
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  return (
    <>
      {/* JSON-LD */}
      <ArticleJsonLd
        title={post.title}
        description={post.metaDescription || post.excerpt || ""}
        url={postUrl}
        imageUrl={post.featuredImage || undefined}
        publishedAt={post.publishedAt?.toISOString() || post.createdAt.toISOString()}
        modifiedAt={post.updatedAt.toISOString()}
        keywords={post.keywords}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteUrl },
          { name: "Blog", url: `${siteUrl}/blog` },
          ...(post.category
            ? [
                {
                  name: post.category.name,
                  url: `${siteUrl}/blog?category=${post.category.slug}`,
                },
              ]
            : []),
          { name: post.title, url: postUrl },
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
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Articles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedPosts.map((relatedPost: typeof relatedPosts[number]) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        {relatedPost.featuredImage && (
                          <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                            <img
                              src={relatedPost.featuredImage}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {relatedPost.title}
                          </h4>
                          {relatedPost.publishedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(relatedPost.publishedAt), "MMM d, yyyy")}
                            </p>
                          )}
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
          <Link href="/blog" className="hover:text-primary">
            Blog
          </Link>
          {post.category && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link
                href={`/blog?category=${post.category.slug}`}
                className="hover:text-primary"
              >
                {post.category.name}
              </Link>
            </>
          )}
        </nav>

        {/* Article Header */}
        <article>
          <header className="mb-8">
            {post.category && (
              <Badge
                className="mb-4"
                style={{ backgroundColor: post.category.color || undefined }}
              >
                {post.category.name}
              </Badge>
            )}
            <h1 className="text-3xl md:text-4xl font-bold font-poppins mb-4">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-4">
                {post.excerpt}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                </span>
              )}
              {post.readingTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readingTime} min read
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.viewCount} views
              </span>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="aspect-video rounded-xl overflow-hidden bg-muted mb-8">
              <img
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-poppins prose-a:text-primary prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
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
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </ContentWithSidebar>
    </>
  );
}

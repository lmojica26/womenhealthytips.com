import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, Sparkles } from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    featuredImageAlt: string | null;
    publishedAt: Date | string | null;
    readingTime: number | null;
    viewCount: number;
    isAiGenerated: boolean;
    category: {
      name: string;
      slug: string;
      color: string | null;
    } | null;
  };
  featured?: boolean;
}

export function PostCard({ post, featured = false }: PostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card
        className={`overflow-hidden h-full hover:shadow-lg transition-shadow group ${
          featured ? "md:flex md:flex-row" : ""
        }`}
      >
        {/* Image */}
        <div
          className={`relative bg-muted overflow-hidden ${
            featured ? "md:w-1/2 aspect-video md:aspect-auto" : "aspect-video"
          }`}
        >
          {post.featuredImage ? (
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-wellness-soft">
              <span className="text-4xl font-bold text-primary/20">WHT</span>
            </div>
          )}
          {post.category && (
            <Badge
              className="absolute top-3 left-3"
              style={{ backgroundColor: post.category.color || undefined }}
            >
              {post.category.name}
            </Badge>
          )}
          {post.isAiGenerated && (
            <div className="absolute top-3 right-3">
              <Sparkles className="h-4 w-4 text-purple-500" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className={featured ? "md:w-1/2" : ""}>
          <CardHeader className={featured ? "pb-2" : ""}>
            <h3
              className={`font-semibold line-clamp-2 group-hover:text-primary transition-colors ${
                featured ? "text-xl md:text-2xl" : "text-lg"
              }`}
            >
              {post.title}
            </h3>
          </CardHeader>
          <CardContent>
            {post.excerpt && (
              <p
                className={`text-muted-foreground mb-4 ${
                  featured ? "line-clamp-3" : "line-clamp-2"
                }`}
              >
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {post.publishedAt && (
                <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
              )}
              {post.readingTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readingTime} min read
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.viewCount}
              </span>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

export function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted animate-pulse" />
      <CardHeader>
        <div className="h-6 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        </div>
        <div className="flex gap-4 mt-4">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

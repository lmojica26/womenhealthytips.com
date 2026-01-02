import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, Play } from "lucide-react";

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnailUrl: string | null;
    duration: number | null;
    publishedAt: Date | null;
    viewCount: number;
    category: {
      name: string;
      slug: string;
      color: string | null;
    } | null;
  };
  featured?: boolean;
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

export function VideoCard({ video, featured = false }: VideoCardProps) {
  return (
    <Link href={`/videos/${video.slug}`}>
      <Card
        className={`overflow-hidden h-full hover:shadow-lg transition-shadow group ${
          featured ? "md:flex md:flex-row" : ""
        }`}
      >
        {/* Thumbnail */}
        <div
          className={`relative bg-muted overflow-hidden ${
            featured ? "md:w-1/2 aspect-video md:aspect-auto" : "aspect-video"
          }`}
        >
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-wellness-soft">
              <Play className="h-12 w-12 text-primary/30" />
            </div>
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:bg-primary transition-colors">
              <Play className="h-8 w-8 text-white fill-white ml-1" />
            </div>
          </div>

          {/* Category badge */}
          {video.category && (
            <Badge
              className="absolute top-3 left-3"
              style={{ backgroundColor: video.category.color || undefined }}
            >
              {video.category.name}
            </Badge>
          )}

          {/* Duration */}
          {video.duration && (
            <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
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
              {video.title}
            </h3>
          </CardHeader>
          <CardContent>
            {video.excerpt && (
              <p
                className={`text-muted-foreground mb-4 ${
                  featured ? "line-clamp-3" : "line-clamp-2"
                }`}
              >
                {video.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {video.publishedAt && (
                <span>{format(new Date(video.publishedAt), "MMM d, yyyy")}</span>
              )}
              {video.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(video.duration)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {video.viewCount}
              </span>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

export function VideoCardSkeleton() {
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

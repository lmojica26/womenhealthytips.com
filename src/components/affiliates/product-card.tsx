"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star } from "lucide-react";

interface ProductCardProps {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  url: string;
  callToAction?: string | null;
  network?: string;
  onClick?: () => void;
}

export function ProductCard({
  name,
  description,
  imageUrl,
  url,
  callToAction = "Shop Now",
  network,
  onClick,
}: ProductCardProps) {
  const handleClick = () => {
    onClick?.();
    window.open(url, "_blank");
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      {imageUrl && (
        <div className="aspect-video bg-muted overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold line-clamp-2">{name}</h3>
          {network && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {network}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
        <Button onClick={handleClick} className="w-full">
          {callToAction}
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

// Horizontal variant for inline placement
export function ProductCardHorizontal({
  name,
  description,
  imageUrl,
  url,
  callToAction = "Learn More",
  onClick,
}: ProductCardProps) {
  const handleClick = () => {
    onClick?.();
    window.open(url, "_blank");
  };

  return (
    <div className="flex gap-4 p-4 border rounded-lg bg-gradient-wellness-soft hover:shadow-md transition-shadow">
      {imageUrl && (
        <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm line-clamp-1">{name}</h4>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {description}
          </p>
        )}
        <Button size="sm" variant="link" className="px-0 mt-1" onClick={handleClick}>
          {callToAction}
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}

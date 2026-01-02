"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  shortCode: string;
  description: string | null;
  imageUrl: string | null;
  callToAction: string | null;
}

interface AffiliateSidebarProps {
  limit?: number;
  title?: string;
}

export function AffiliateSidebar({
  limit = 3,
  title = "Recommended Products",
}: AffiliateSidebarProps) {
  const [affiliates, setAffiliates] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAffiliates = async () => {
      try {
        const res = await fetch("/api/affiliates?sidebar=true");
        const data = await res.json();
        setAffiliates(data.slice(0, limit));
      } catch (error) {
        console.error("Error fetching affiliates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAffiliates();
  }, [limit]);

  if (loading) {
    return (
      <Card className="sticky top-20">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (affiliates.length === 0) {
    return null;
  }

  const handleClick = async (affiliate: AffiliateLink) => {
    // Track click by redirecting through our API
    window.open(`/api/affiliates/${affiliate.id}?track=true`, "_blank");
  };

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {affiliates.map((affiliate) => (
          <div
            key={affiliate.id}
            className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {affiliate.imageUrl && (
              <div className="aspect-video bg-muted overflow-hidden">
                <img
                  src={affiliate.imageUrl}
                  alt={affiliate.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            )}
            <div className="p-3 space-y-2">
              <h4 className="font-medium text-sm line-clamp-2">
                {affiliate.name}
              </h4>
              {affiliate.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {affiliate.description}
                </p>
              )}
              <Button
                size="sm"
                className="w-full"
                onClick={() => handleClick(affiliate)}
              >
                {affiliate.callToAction || "Shop Now"}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground text-center pt-2 border-t">
          Affiliate links - we may earn a commission
        </p>
      </CardContent>
    </Card>
  );
}

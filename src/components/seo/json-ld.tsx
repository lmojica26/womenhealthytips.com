interface ArticleJsonLdProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName?: string;
  keywords?: string[];
}

export function ArticleJsonLd({
  title,
  description,
  url,
  imageUrl,
  publishedAt,
  modifiedAt,
  authorName = "Women's Health Tips",
  keywords = [],
}: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    image: imageUrl,
    url: url,
    datePublished: publishedAt,
    dateModified: modifiedAt || publishedAt,
    author: {
      "@type": "Organization",
      name: authorName,
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Women's Health Tips",
      url: process.env.NEXT_PUBLIC_SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
    keywords: keywords.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface RecipeJsonLdProps {
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  servings?: number;
  ingredients: string[];
  instructions: string[];
  calories?: number;
  keywords?: string[];
  publishedAt: string;
}

export function RecipeJsonLd({
  name,
  description,
  url,
  imageUrl,
  prepTime,
  cookTime,
  totalTime,
  servings,
  ingredients,
  instructions,
  calories,
  keywords = [],
  publishedAt,
}: RecipeJsonLdProps) {
  const formatDuration = (minutes?: number) => {
    if (!minutes) return undefined;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `PT${hours > 0 ? `${hours}H` : ""}${mins > 0 ? `${mins}M` : ""}`;
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name,
    description,
    image: imageUrl,
    url,
    datePublished: publishedAt,
    prepTime: formatDuration(prepTime),
    cookTime: formatDuration(cookTime),
    totalTime: formatDuration(totalTime),
    recipeYield: servings ? `${servings} servings` : undefined,
    recipeIngredient: ingredients,
    recipeInstructions: instructions.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: step,
    })),
    nutrition: calories
      ? {
          "@type": "NutritionInformation",
          calories: `${calories} calories`,
        }
      : undefined,
    keywords: keywords.join(", "),
    author: {
      "@type": "Organization",
      name: "Women's Health Tips",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface VideoJsonLdProps {
  name: string;
  description: string;
  thumbnailUrl?: string;
  uploadDate: string;
  duration?: number;
  embedUrl: string;
}

export function VideoJsonLd({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  embedUrl,
}: VideoJsonLdProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return undefined;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `PT${hours > 0 ? `${hours}H` : ""}${mins > 0 ? `${mins}M` : ""}${secs > 0 ? `${secs}S` : ""}`;
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl,
    uploadDate,
    duration: formatDuration(duration),
    embedUrl,
    publisher: {
      "@type": "Organization",
      name: "Women's Health Tips",
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

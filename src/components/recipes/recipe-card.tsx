import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Flame, ChefHat } from "lucide-react";

interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    featuredImageAlt: string | null;
    prepTime: number | null;
    cookTime: number | null;
    totalTime: number | null;
    servings: number | null;
    calories: number | null;
    difficulty: string | null;
    dietType: string | null;
    category: {
      name: string;
      slug: string;
      color: string | null;
    } | null;
  };
  featured?: boolean;
}

const DIET_LABELS: Record<string, { label: string; color: string }> = {
  KETO: { label: "Keto", color: "#f59e0b" },
  VEGAN: { label: "Vegan", color: "#22c55e" },
  VEGETARIAN: { label: "Vegetarian", color: "#84cc16" },
  PALEO: { label: "Paleo", color: "#ef4444" },
  GLUTEN_FREE: { label: "Gluten Free", color: "#8b5cf6" },
  DAIRY_FREE: { label: "Dairy Free", color: "#06b6d4" },
  LOW_CARB: { label: "Low Carb", color: "#ec4899" },
  HIGH_PROTEIN: { label: "High Protein", color: "#f97316" },
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export function RecipeCard({ recipe, featured = false }: RecipeCardProps) {
  const dietInfo = recipe.dietType ? DIET_LABELS[recipe.dietType] : null;

  return (
    <Link href={`/recipes/${recipe.slug}`}>
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
          {recipe.featuredImage ? (
            <img
              src={recipe.featuredImage}
              alt={recipe.featuredImageAlt || recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-wellness-soft">
              <ChefHat className="h-12 w-12 text-primary/30" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            {dietInfo && (
              <Badge style={{ backgroundColor: dietInfo.color }}>
                {dietInfo.label}
              </Badge>
            )}
          </div>
          {recipe.difficulty && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary">
                {DIFFICULTY_LABELS[recipe.difficulty] || recipe.difficulty}
              </Badge>
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
              {recipe.title}
            </h3>
          </CardHeader>
          <CardContent>
            {recipe.excerpt && (
              <p
                className={`text-muted-foreground mb-4 ${
                  featured ? "line-clamp-3" : "line-clamp-2"
                }`}
              >
                {recipe.excerpt}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {recipe.totalTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {recipe.totalTime} min
                </span>
              )}
              {recipe.servings && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {recipe.servings} servings
                </span>
              )}
              {recipe.calories && (
                <span className="flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  {recipe.calories} cal
                </span>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

export function RecipeCardSkeleton() {
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

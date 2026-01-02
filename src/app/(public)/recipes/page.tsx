import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ContentWithSidebar } from "@/components/layout/content-with-sidebar";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Healthy Recipes",
  description:
    "Discover delicious and nutritious recipes for every diet - keto, vegan, clean eating, and more.",
};

interface RecipesPageProps {
  searchParams: Promise<{ page?: string; diet?: string }>;
}

const DIET_TYPES = [
  { value: "KETO", label: "Keto", color: "#f59e0b" },
  { value: "VEGAN", label: "Vegan", color: "#22c55e" },
  { value: "VEGETARIAN", label: "Vegetarian", color: "#84cc16" },
  { value: "PALEO", label: "Paleo", color: "#ef4444" },
  { value: "GLUTEN_FREE", label: "Gluten Free", color: "#8b5cf6" },
  { value: "DAIRY_FREE", label: "Dairy Free", color: "#06b6d4" },
  { value: "LOW_CARB", label: "Low Carb", color: "#ec4899" },
  { value: "HIGH_PROTEIN", label: "High Protein", color: "#f97316" },
];

async function getRecipes(page: number, dietType?: string) {
  const limit = 9;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
  };

  if (dietType) {
    where.dietType = dietType;
  }

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
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
    prisma.recipe.count({ where }),
  ]);

  return {
    recipes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const dietType = params.diet;

  const { recipes, pagination } = await getRecipes(page, dietType);

  const currentDiet = dietType
    ? DIET_TYPES.find((d: typeof DIET_TYPES[number]) => d.value === dietType)
    : null;

  return (
    <ContentWithSidebar
      sidebarContent={
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Diet Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/recipes">
              <Badge
                variant={!dietType ? "default" : "outline"}
                className="cursor-pointer"
              >
                All Recipes
              </Badge>
            </Link>
            {DIET_TYPES.map((diet: typeof DIET_TYPES[number]) => (
              <Link key={diet.value} href={`/recipes?diet=${diet.value}`}>
                <Badge
                  variant={dietType === diet.value ? "default" : "outline"}
                  className="cursor-pointer"
                  style={{
                    borderColor:
                      dietType !== diet.value ? diet.color : undefined,
                  }}
                >
                  {diet.label}
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
          {currentDiet ? `${currentDiet.label} Recipes` : "Healthy Recipes"}
        </h1>
        <p className="text-muted-foreground">
          {currentDiet
            ? `Browse our collection of ${currentDiet.label.toLowerCase()} recipes`
            : "Delicious and nutritious recipes for a healthier lifestyle"}
        </p>
      </div>

      {/* Recipes Grid */}
      {recipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No recipes found.</p>
          {dietType && (
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/recipes">View all recipes</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Featured Recipe */}
          {page === 1 && recipes.length > 0 && (
            <div className="mb-8">
              <RecipeCard recipe={recipes[0]} featured />
            </div>
          )}

          {/* Recipes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(page === 1 ? recipes.slice(1) : recipes).map((recipe: typeof recipes[number]) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <Button variant="outline" asChild>
                  <Link
                    href={`/recipes?page=${page - 1}${
                      dietType ? `&diet=${dietType}` : ""
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
                    href={`/recipes?page=${page + 1}${
                      dietType ? `&diet=${dietType}` : ""
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

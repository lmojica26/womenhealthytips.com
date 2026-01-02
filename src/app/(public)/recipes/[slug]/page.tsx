import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import prisma from "@/lib/prisma";
import { ContentWithSidebar } from "@/components/layout/content-with-sidebar";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { RecipeJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Users,
  Flame,
  ChefHat,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  ChevronRight,
  Printer,
  Timer,
} from "lucide-react";

interface RecipePageProps {
  params: Promise<{ slug: string }>;
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

async function getRecipe(slug: string) {
  const recipe = await prisma.recipe.findUnique({
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

  if (recipe) {
    // Increment view count
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return recipe;
}

async function getRelatedRecipes(recipeId: string, dietType: string | null) {
  return prisma.recipe.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: recipeId },
      ...(dietType && { dietType }),
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
}: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { slug, status: "PUBLISHED" },
  });

  if (!recipe) {
    return { title: "Recipe Not Found" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://womenhealthytips.com";

  return {
    title: recipe.metaTitle || recipe.title,
    description: recipe.metaDescription || recipe.excerpt || undefined,
    keywords: recipe.keywords,
    openGraph: {
      title: recipe.metaTitle || recipe.title,
      description: recipe.metaDescription || recipe.excerpt || undefined,
      type: "article",
      publishedTime: recipe.publishedAt?.toISOString(),
      modifiedTime: recipe.updatedAt.toISOString(),
      images: recipe.featuredImage
        ? [{ url: recipe.featuredImage, alt: recipe.featuredImageAlt || recipe.title }]
        : undefined,
      url: `${siteUrl}/recipes/${recipe.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.metaTitle || recipe.title,
      description: recipe.metaDescription || recipe.excerpt || undefined,
      images: recipe.featuredImage ? [recipe.featuredImage] : undefined,
    },
    alternates: {
      canonical: recipe.canonicalUrl || `${siteUrl}/recipes/${recipe.slug}`,
    },
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);

  if (!recipe) {
    notFound();
  }

  const relatedRecipes = await getRelatedRecipes(recipe.id, recipe.dietType);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://womenhealthytips.com";
  const recipeUrl = `${siteUrl}/recipes/${recipe.slug}`;
  const dietInfo = recipe.dietType ? DIET_LABELS[recipe.dietType] : null;

  // Parse ingredients and instructions from JSON
  const ingredients: string[] = recipe.ingredients as string[] || [];
  const instructions: string[] = recipe.instructions as string[] || [];

  return (
    <>
      {/* JSON-LD */}
      <RecipeJsonLd
        name={recipe.title}
        description={recipe.metaDescription || recipe.excerpt || ""}
        url={recipeUrl}
        imageUrl={recipe.featuredImage || undefined}
        prepTime={recipe.prepTime || undefined}
        cookTime={recipe.cookTime || undefined}
        totalTime={recipe.totalTime || undefined}
        servings={recipe.servings || undefined}
        ingredients={ingredients}
        instructions={instructions}
        calories={recipe.calories || undefined}
        keywords={recipe.keywords}
        publishedAt={recipe.publishedAt?.toISOString() || recipe.createdAt.toISOString()}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteUrl },
          { name: "Recipes", url: `${siteUrl}/recipes` },
          ...(dietInfo
            ? [
                {
                  name: dietInfo.label,
                  url: `${siteUrl}/recipes?diet=${recipe.dietType}`,
                },
              ]
            : []),
          { name: recipe.title, url: recipeUrl },
        ]}
      />

      <ContentWithSidebar
        sidebarContent={
          <>
            {/* Quick Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recipe Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recipe.prepTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      Prep Time
                    </span>
                    <span className="font-medium">{recipe.prepTime} min</span>
                  </div>
                )}
                {recipe.cookTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Cook Time
                    </span>
                    <span className="font-medium">{recipe.cookTime} min</span>
                  </div>
                )}
                {recipe.totalTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Time</span>
                    <span className="font-medium">{recipe.totalTime} min</span>
                  </div>
                )}
                <Separator />
                {recipe.servings && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Servings
                    </span>
                    <span className="font-medium">{recipe.servings}</span>
                  </div>
                )}
                {recipe.calories && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Flame className="h-4 w-4" />
                      Calories
                    </span>
                    <span className="font-medium">{recipe.calories} kcal</span>
                  </div>
                )}
                {recipe.difficulty && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <ChefHat className="h-4 w-4" />
                      Difficulty
                    </span>
                    <Badge variant="secondary">
                      {DIFFICULTY_LABELS[recipe.difficulty] || recipe.difficulty}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

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
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(recipeUrl)}&text=${encodeURIComponent(recipe.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(recipeUrl)}&title=${encodeURIComponent(recipe.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Related Recipes */}
            {relatedRecipes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">More Recipes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedRecipes.map((relatedRecipe) => (
                    <Link
                      key={relatedRecipe.id}
                      href={`/recipes/${relatedRecipe.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        {relatedRecipe.featuredImage && (
                          <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                            <img
                              src={relatedRecipe.featuredImage}
                              alt={relatedRecipe.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {relatedRecipe.title}
                          </h4>
                          {relatedRecipe.totalTime && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {relatedRecipe.totalTime} min
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
          <Link href="/recipes" className="hover:text-primary">
            Recipes
          </Link>
          {dietInfo && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link
                href={`/recipes?diet=${recipe.dietType}`}
                className="hover:text-primary"
              >
                {dietInfo.label}
              </Link>
            </>
          )}
        </nav>

        {/* Recipe Header */}
        <article>
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {dietInfo && (
                <Badge style={{ backgroundColor: dietInfo.color }}>
                  {dietInfo.label}
                </Badge>
              )}
              {recipe.category && (
                <Badge
                  variant="outline"
                  style={{ borderColor: recipe.category.color || undefined }}
                >
                  {recipe.category.name}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-poppins mb-4">
              {recipe.title}
            </h1>
            {recipe.excerpt && (
              <p className="text-xl text-muted-foreground mb-4">
                {recipe.excerpt}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {recipe.totalTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {recipe.totalTime} min
                </span>
              )}
              {recipe.servings && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {recipe.servings} servings
                </span>
              )}
              {recipe.calories && (
                <span className="flex items-center gap-1">
                  <Flame className="h-4 w-4" />
                  {recipe.calories} calories
                </span>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {recipe.featuredImage && (
            <div className="aspect-video rounded-xl overflow-hidden bg-muted mb-8">
              <img
                src={recipe.featuredImage}
                alt={recipe.featuredImageAlt || recipe.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold font-poppins mb-4">Ingredients</h2>
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    {ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Instructions */}
          {instructions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold font-poppins mb-4">Instructions</h2>
              <div className="space-y-4">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-semibold">
                      {index + 1}
                    </div>
                    <p className="pt-1">{instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Content */}
          {recipe.content && (
            <div
              className="prose prose-lg max-w-none prose-headings:font-poppins prose-a:text-primary prose-img:rounded-lg mb-8"
              dangerouslySetInnerHTML={{ __html: recipe.content }}
            />
          )}

          {/* Nutrition Facts */}
          {(recipe.calories || recipe.protein || recipe.carbs || recipe.fat || recipe.fiber) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold font-poppins mb-4">Nutrition Facts</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    {recipe.calories && (
                      <div>
                        <div className="text-2xl font-bold text-primary">{recipe.calories}</div>
                        <div className="text-sm text-muted-foreground">Calories</div>
                      </div>
                    )}
                    {recipe.protein && (
                      <div>
                        <div className="text-2xl font-bold text-primary">{recipe.protein}g</div>
                        <div className="text-sm text-muted-foreground">Protein</div>
                      </div>
                    )}
                    {recipe.carbs && (
                      <div>
                        <div className="text-2xl font-bold text-primary">{recipe.carbs}g</div>
                        <div className="text-sm text-muted-foreground">Carbs</div>
                      </div>
                    )}
                    {recipe.fat && (
                      <div>
                        <div className="text-2xl font-bold text-primary">{recipe.fat}g</div>
                        <div className="text-sm text-muted-foreground">Fat</div>
                      </div>
                    )}
                    {recipe.fiber && (
                      <div>
                        <div className="text-2xl font-bold text-primary">{recipe.fiber}g</div>
                        <div className="text-sm text-muted-foreground">Fiber</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
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
            <Link href="/recipes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recipes
            </Link>
          </Button>
        </div>
      </ContentWithSidebar>
    </>
  );
}

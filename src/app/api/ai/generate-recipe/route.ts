import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { generateRecipe, generateImagePrompt, generateImage } from "@/lib/openai";
import { generateRecipeWithClaude } from "@/lib/claude";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 100);
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      topic,
      dietType = "HEALTHY",
      categoryId,
      useAiImage = true,
      provider = "openai",
    } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Map diet type to readable name
    const dietNames: Record<string, string> = {
      KETO: "Keto",
      VEGAN: "Vegan",
      VEGETARIAN: "Vegetarian",
      PALEO: "Paleo",
      GLUTEN_FREE: "Gluten-Free",
      DAIRY_FREE: "Dairy-Free",
      LOW_CARB: "Low Carb",
      HIGH_PROTEIN: "High Protein",
      HEALTHY: "Healthy",
    };

    const dietName = dietNames[dietType] || "Healthy";

    // Generate recipe content
    let content;
    let aiModel: string;

    try {
      if (provider === "claude") {
        content = await generateRecipeWithClaude(topic, dietName);
        aiModel = "claude-sonnet-4-20250514";
      } else {
        content = await generateRecipe(topic, dietName);
        aiModel = "gpt-4-turbo-preview";
      }
    } catch (error) {
      if (provider === "openai") {
        console.log("OpenAI failed, falling back to Claude...");
        content = await generateRecipeWithClaude(topic, dietName);
        aiModel = "claude-sonnet-4-20250514 (fallback)";
      } else {
        throw error;
      }
    }

    // Generate featured image
    let featuredImage: string | null = null;
    if (useAiImage && process.env.OPENAI_API_KEY) {
      try {
        const imagePrompt = await generateImagePrompt(
          content.title,
          "Healthy Recipes"
        );
        featuredImage = await generateImage(imagePrompt);
      } catch (error) {
        console.error("Failed to generate image:", error);
      }
    }

    // Generate unique slug
    let slug = generateSlug(content.title);
    const existingRecipe = await prisma.recipe.findUnique({ where: { slug } });
    if (existingRecipe) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create the recipe
    const recipe = await prisma.recipe.create({
      data: {
        title: content.title,
        slug,
        excerpt: content.excerpt,
        content: content.tips || "",
        featuredImage,
        featuredImageAlt: featuredImage ? content.title : null,
        prepTime: content.prepTime,
        cookTime: content.cookTime,
        totalTime: content.totalTime,
        servings: content.servings,
        difficulty: content.difficulty,
        dietType,
        ingredients: content.ingredients,
        instructions: content.instructions,
        calories: content.calories,
        protein: content.protein,
        carbs: content.carbs,
        fat: content.fat,
        fiber: content.fiber,
        keywords: content.keywords || [],
        metaTitle: content.title,
        metaDescription: content.excerpt,
        isAiGenerated: true,
        aiModel,
        status: "DRAFT",
        categoryId: categoryId || null,
        // Set diet boolean flags
        isKeto: dietType === "KETO",
        isVegan: dietType === "VEGAN",
        isVegetarian: dietType === "VEGETARIAN" || dietType === "VEGAN",
        isGlutenFree: dietType === "GLUTEN_FREE",
        isDairyFree: dietType === "DAIRY_FREE",
      },
      include: {
        category: true,
      },
    });

    // Log the generation
    await prisma.aiGenerationLog.create({
      data: {
        type: "RECIPE",
        recipeId: recipe.id,
        prompt: `${dietName} recipe: ${topic}`,
        model: aiModel,
        tokensUsed: 0,
        success: true,
      },
    });

    return NextResponse.json({
      success: true,
      recipe,
      message: "Recipe generated successfully",
    });
  } catch (error) {
    console.error("Error generating recipe:", error);

    try {
      await prisma.aiGenerationLog.create({
        data: {
          type: "RECIPE",
          prompt: "unknown",
          model: "unknown",
          tokensUsed: 0,
          success: false,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } catch {
      // Ignore logging errors
    }

    return NextResponse.json(
      { error: "Failed to generate recipe" },
      { status: 500 }
    );
  }
}

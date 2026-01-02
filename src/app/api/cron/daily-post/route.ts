import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateBlogPost, generateImagePrompt, generateImage } from "@/lib/openai";
import { generateBlogPostWithClaude } from "@/lib/claude";

// Topic rotation for daily posts
const DAILY_TOPICS = [
  // Nutrition
  { topic: "Essential vitamins every woman needs", category: "nutrition" },
  { topic: "Healthy breakfast ideas for busy mornings", category: "nutrition" },
  { topic: "Anti-inflammatory foods for women's health", category: "nutrition" },
  { topic: "Iron-rich foods to boost your energy", category: "nutrition" },
  { topic: "Best foods for hormonal balance", category: "nutrition" },
  { topic: "Hydration tips for glowing skin", category: "nutrition" },
  { topic: "Superfoods for women over 40", category: "nutrition" },

  // Fitness
  { topic: "10-minute morning workout routine", category: "fitness" },
  { topic: "Strength training basics for beginners", category: "fitness" },
  { topic: "Low-impact exercises for joint health", category: "fitness" },
  { topic: "Core exercises for a stronger back", category: "fitness" },
  { topic: "Walking workout to boost metabolism", category: "fitness" },

  // Wellness
  { topic: "Stress management techniques that work", category: "wellness" },
  { topic: "Better sleep habits for more energy", category: "wellness" },
  { topic: "Mindfulness practices for busy women", category: "wellness" },
  { topic: "Self-care routines for mental health", category: "wellness" },
  { topic: "Building healthy daily habits", category: "wellness" },

  // Clean Eating
  { topic: "Meal prep guide for the week", category: "clean eating" },
  { topic: "Reading food labels like a pro", category: "clean eating" },
  { topic: "Reducing processed foods in your diet", category: "clean eating" },

  // Keto
  { topic: "Keto diet basics for beginners", category: "keto" },
  { topic: "Best keto snacks for weight loss", category: "keto" },
  { topic: "Keto meal planning made easy", category: "keto" },

  // Vegan
  { topic: "Plant-based protein sources", category: "vegan" },
  { topic: "Easy vegan dinner recipes", category: "vegan" },
  { topic: "Transitioning to a plant-based diet", category: "vegan" },

  // Yoga
  { topic: "Morning yoga for flexibility", category: "yoga" },
  { topic: "Yoga poses for stress relief", category: "yoga" },
  { topic: "Beginner's guide to meditation", category: "yoga" },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 100);
}

async function getCategoryByName(name: string) {
  // Try to find exact match first
  let category = await prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  // If not found, try partial match
  if (!category) {
    category = await prisma.category.findFirst({
      where: { name: { contains: name, mode: "insensitive" } },
    });
  }

  return category;
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if we already posted today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysPosts = await prisma.post.count({
      where: {
        isAiGenerated: true,
        createdAt: { gte: today },
      },
    });

    if (todaysPosts > 0) {
      return NextResponse.json({
        success: true,
        message: "Already posted today",
        skipped: true,
      });
    }

    // Get the day of the year to rotate topics
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const topicIndex = dayOfYear % DAILY_TOPICS.length;
    const selectedTopic = DAILY_TOPICS[topicIndex];

    // Get category
    const category = await getCategoryByName(selectedTopic.category);
    const categoryName = category?.name || "Health & Wellness";

    // Generate content with fallback
    let content;
    let aiModel: string;

    try {
      content = await generateBlogPost(selectedTopic.topic, categoryName);
      aiModel = "gpt-4-turbo-preview";
    } catch (error) {
      console.log("OpenAI failed, falling back to Claude...", error);
      content = await generateBlogPostWithClaude(selectedTopic.topic, categoryName);
      aiModel = "claude-sonnet-4-20250514";
    }

    // Generate featured image
    let featuredImage: string | null = null;
    if (process.env.OPENAI_API_KEY) {
      try {
        const imagePrompt = await generateImagePrompt(content.title, categoryName);
        featuredImage = await generateImage(imagePrompt);
      } catch (error) {
        console.error("Failed to generate image:", error);
      }
    }

    // Generate unique slug
    let slug = generateSlug(content.title);
    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create the post (published immediately)
    const post = await prisma.post.create({
      data: {
        title: content.title,
        slug,
        excerpt: content.excerpt,
        content: content.content,
        featuredImage,
        featuredImageAlt: featuredImage ? content.title : null,
        readingTime: content.readingTime,
        keywords: content.keywords,
        metaTitle: content.title,
        metaDescription: content.excerpt,
        isAiGenerated: true,
        aiModel,
        status: "PUBLISHED",
        publishedAt: new Date(),
        categoryId: category?.id || null,
      },
    });

    // Log the generation
    await prisma.aiGenerationLog.create({
      data: {
        type: "BLOG_POST",
        postId: post.id,
        prompt: selectedTopic.topic,
        model: aiModel,
        tokensUsed: 0,
        success: true,
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
      },
      topic: selectedTopic,
      message: "Daily post created successfully",
    });
  } catch (error) {
    console.error("Error creating daily post:", error);

    // Log the failure
    try {
      await prisma.aiGenerationLog.create({
        data: {
          type: "BLOG_POST",
          prompt: "daily-cron",
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
      { error: "Failed to create daily post" },
      { status: 500 }
    );
  }
}

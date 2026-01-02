import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { generateBlogPost, generateImagePrompt, generateImage } from "@/lib/openai";
import { generateBlogPostWithClaude } from "@/lib/claude";

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
    const { topic, categoryId, useAiImage = true, provider = "openai" } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Get category name if provided
    let categoryName = "Health & Wellness";
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (category) {
        categoryName = category.name;
      }
    }

    // Generate blog content
    let content;
    let aiModel: string;

    try {
      if (provider === "claude") {
        content = await generateBlogPostWithClaude(topic, categoryName);
        aiModel = "claude-sonnet-4-20250514";
      } else {
        content = await generateBlogPost(topic, categoryName);
        aiModel = "gpt-4-turbo-preview";
      }
    } catch (error) {
      // Fallback to Claude if OpenAI fails
      if (provider === "openai") {
        console.log("OpenAI failed, falling back to Claude...");
        content = await generateBlogPostWithClaude(topic, categoryName);
        aiModel = "claude-sonnet-4-20250514 (fallback)";
      } else {
        throw error;
      }
    }

    // Generate featured image
    let featuredImage: string | null = null;
    if (useAiImage && process.env.OPENAI_API_KEY) {
      try {
        const imagePrompt = await generateImagePrompt(content.title, categoryName);
        featuredImage = await generateImage(imagePrompt);
      } catch (error) {
        console.error("Failed to generate image:", error);
        // Continue without image
      }
    }

    // Generate unique slug
    let slug = generateSlug(content.title);
    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create the post
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
        status: "DRAFT",
        categoryId: categoryId || null,
      },
      include: {
        category: true,
      },
    });

    // Log the generation
    await prisma.aiGenerationLog.create({
      data: {
        type: "BLOG_POST",
        postId: post.id,
        prompt: topic,
        model: aiModel,
        tokensUsed: 0,
        success: true,
      },
    });

    return NextResponse.json({
      success: true,
      post,
      message: "Blog post generated successfully",
    });
  } catch (error) {
    console.error("Error generating post:", error);

    // Log the failure
    try {
      await prisma.aiGenerationLog.create({
        data: {
          type: "BLOG_POST",
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
      { error: "Failed to generate blog post" },
      { status: 500 }
    );
  }
}

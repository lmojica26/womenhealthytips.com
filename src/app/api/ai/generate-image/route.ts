import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateImage, generateImagePrompt } from "@/lib/openai";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt, title, category, postId } = body;

    let imagePrompt = prompt;

    // If title and category provided, generate a better prompt
    if (!prompt && title) {
      imagePrompt = await generateImagePrompt(title, category || "Health & Wellness");
    }

    if (!imagePrompt) {
      return NextResponse.json(
        { error: "Either prompt or title is required" },
        { status: 400 }
      );
    }

    // Generate the image
    const imageUrl = await generateImage(imagePrompt);

    // If postId provided, update the post with the new image
    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: {
          featuredImage: imageUrl,
          featuredImageAlt: title || "AI Generated Image",
        },
      });
    }

    // Log the generation
    await prisma.aiGenerationLog.create({
      data: {
        type: "IMAGE",
        postId: postId || null,
        prompt: imagePrompt,
        model: "dall-e-3",
        tokensUsed: 0,
        success: true,
      },
    });

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: imagePrompt,
    });
  } catch (error) {
    console.error("Error generating image:", error);

    // Log the failure
    try {
      await prisma.aiGenerationLog.create({
        data: {
          type: "IMAGE",
          prompt: "unknown",
          model: "dall-e-3",
          tokensUsed: 0,
          success: false,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } catch {
      // Ignore logging errors
    }

    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}

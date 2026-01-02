import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { updatePostSchema } from "@/lib/validations";
import slugify from "slugify";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/posts/[id] - Get a single post
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true, color: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
        affiliateLinks: {
          select: {
            id: true,
            name: true,
            url: true,
            imageUrl: true,
            callToAction: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // If not authenticated and post is not published, deny access
    if (!userId && post.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Increment view count for published posts (only for public views)
    if (!userId && post.status === "PUBLISHED") {
      await prisma.post.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - Update a post (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updatePostSchema.parse(body);

    // Check if post exists
    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Handle slug update
    let slug = validatedData.slug;
    if (validatedData.title && !slug) {
      slug = slugify(validatedData.title, { lower: true, strict: true });
    }

    // Ensure slug is unique if changed
    if (slug && slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({ where: { slug } });
      if (slugExists) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Calculate reading time if content changed
    let readingTime = existingPost.readingTime;
    if (validatedData.content) {
      const wordCount = validatedData.content.split(/\s+/).length;
      readingTime = Math.ceil(wordCount / 200);
    }

    // Handle publishedAt
    let publishedAt = validatedData.publishedAt
      ? new Date(validatedData.publishedAt)
      : existingPost.publishedAt;

    // If changing to PUBLISHED and no publishedAt, set it now
    if (
      validatedData.status === "PUBLISHED" &&
      existingPost.status !== "PUBLISHED" &&
      !publishedAt
    ) {
      publishedAt = new Date();
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(slug && { slug }),
        ...(validatedData.excerpt !== undefined && {
          excerpt: validatedData.excerpt,
        }),
        ...(validatedData.content && { content: validatedData.content }),
        ...(validatedData.contentJson !== undefined && {
          contentJson: validatedData.contentJson,
        }),
        ...(validatedData.featuredImage !== undefined && {
          featuredImage: validatedData.featuredImage,
        }),
        ...(validatedData.featuredImageAlt !== undefined && {
          featuredImageAlt: validatedData.featuredImageAlt,
        }),
        ...(validatedData.status && { status: validatedData.status }),
        publishedAt,
        ...(validatedData.scheduledAt !== undefined && {
          scheduledAt: validatedData.scheduledAt
            ? new Date(validatedData.scheduledAt)
            : null,
        }),
        ...(validatedData.categoryId !== undefined && {
          categoryId: validatedData.categoryId,
        }),
        ...(validatedData.metaTitle !== undefined && {
          metaTitle: validatedData.metaTitle,
        }),
        ...(validatedData.metaDescription !== undefined && {
          metaDescription: validatedData.metaDescription,
        }),
        ...(validatedData.keywords && { keywords: validatedData.keywords }),
        readingTime,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete a post (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if post exists
    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

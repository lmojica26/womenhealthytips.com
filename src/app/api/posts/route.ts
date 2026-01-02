import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createPostSchema, paginationSchema } from "@/lib/validations";
import slugify from "slugify";

// GET /api/posts - List posts (public for published, all for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { userId } = await auth();

    // Parse query params
    const params = paginationSchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      status: searchParams.get("status") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    const skip = (params.page - 1) * params.limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    // If not authenticated, only show published posts
    if (!userId) {
      where.status = "PUBLISHED";
    } else if (params.status) {
      where.status = params.status;
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { excerpt: { contains: params.search, mode: "insensitive" } },
      ];
    }

    // Get posts with pagination
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true, color: true },
          },
        },
        orderBy: { [params.sortBy]: params.sortOrder },
        skip,
        take: params.limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post (admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPostSchema.parse(body);

    // Generate slug if not provided
    let slug = validatedData.slug;
    if (!slug) {
      slug = slugify(validatedData.title, { lower: true, strict: true });
    }

    // Ensure slug is unique
    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    // Calculate reading time (roughly 200 words per minute)
    const wordCount = validatedData.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Set publishedAt if status is PUBLISHED
    let publishedAt = validatedData.publishedAt
      ? new Date(validatedData.publishedAt)
      : null;
    if (validatedData.status === "PUBLISHED" && !publishedAt) {
      publishedAt = new Date();
    }

    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        slug,
        excerpt: validatedData.excerpt,
        content: validatedData.content,
        contentJson: validatedData.contentJson,
        featuredImage: validatedData.featuredImage,
        featuredImageAlt: validatedData.featuredImageAlt,
        status: validatedData.status,
        publishedAt,
        scheduledAt: validatedData.scheduledAt
          ? new Date(validatedData.scheduledAt)
          : null,
        categoryId: validatedData.categoryId,
        metaTitle: validatedData.metaTitle || validatedData.title,
        metaDescription: validatedData.metaDescription || validatedData.excerpt,
        keywords: validatedData.keywords || [],
        readingTime,
        isAiGenerated: validatedData.isAiGenerated,
        aiModel: validatedData.aiModel,
        aiPrompt: validatedData.aiPrompt,
        authorId: userId,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

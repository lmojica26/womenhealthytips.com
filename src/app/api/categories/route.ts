import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createCategorySchema, updateCategorySchema } from "@/lib/validations";
import slugify from "slugify";

// GET /api/categories - List all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            posts: { where: { status: "PUBLISHED" } },
            recipes: { where: { status: "PUBLISHED" } },
            videos: { where: { status: "PUBLISHED" } },
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category (admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    // Generate slug if not provided
    let slug = validatedData.slug;
    if (!slug) {
      slug = slugify(validatedData.name, { lower: true, strict: true });
    }

    // Ensure slug is unique
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });
    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        color: validatedData.color || "#10b981",
        icon: validatedData.icon,
        order: validatedData.order,
        metaTitle: validatedData.metaTitle,
        metaDescription: validatedData.metaDescription,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// PUT /api/categories - Update a category (admin only)
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const validatedData = updateCategorySchema.parse(data);

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Handle slug update
    let slug = validatedData.slug;
    if (validatedData.name && !slug) {
      slug = slugify(validatedData.name, { lower: true, strict: true });
    }

    // Ensure slug is unique if changed
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json(
          { error: "Category with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(slug && { slug }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
        ...(validatedData.color && { color: validatedData.color }),
        ...(validatedData.icon !== undefined && { icon: validatedData.icon }),
        ...(validatedData.order !== undefined && { order: validatedData.order }),
        ...(validatedData.metaTitle !== undefined && {
          metaTitle: validatedData.metaTitle,
        }),
        ...(validatedData.metaDescription !== undefined && {
          metaDescription: validatedData.metaDescription,
        }),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories - Delete a category (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has content
    const contentCount = await prisma.post.count({
      where: { categoryId: id },
    });
    if (contentCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category with existing content. Reassign or delete the content first.",
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createAffiliateLinkSchema } from "@/lib/validations";

// GET /api/affiliates - List all affiliate links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { userId } = await auth();
    const sidebarOnly = searchParams.get("sidebar") === "true";

    const where: Record<string, unknown> = {};

    // For public requests, only show active sidebar links
    if (!userId || sidebarOnly) {
      where.isActive = true;
      if (sidebarOnly) {
        where.showInSidebar = true;
      }
    }

    const affiliates = await prisma.affiliateLink.findMany({
      where,
      orderBy: sidebarOnly
        ? { sidebarOrder: "asc" }
        : { createdAt: "desc" },
    });

    return NextResponse.json(affiliates);
  } catch (error) {
    console.error("Error fetching affiliates:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliates" },
      { status: 500 }
    );
  }
}

// POST /api/affiliates - Create a new affiliate link (admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAffiliateLinkSchema.parse(body);

    // Generate shortCode if not provided
    let shortCode = validatedData.shortCode;
    if (!shortCode) {
      shortCode = `aff-${Date.now().toString(36)}`;
    }

    // Ensure shortCode is unique
    const existingAffiliate = await prisma.affiliateLink.findUnique({
      where: { shortCode },
    });
    if (existingAffiliate) {
      shortCode = `${shortCode}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const affiliate = await prisma.affiliateLink.create({
      data: {
        name: validatedData.name,
        url: validatedData.url,
        shortCode,
        network: validatedData.network,
        productId: validatedData.productId,
        commission: validatedData.commission,
        description: validatedData.description,
        imageUrl: validatedData.imageUrl,
        callToAction: validatedData.callToAction || "Shop Now",
        showInSidebar: validatedData.showInSidebar,
        sidebarOrder: validatedData.sidebarOrder,
        isActive: validatedData.isActive,
      },
    });

    return NextResponse.json(affiliate, { status: 201 });
  } catch (error) {
    console.error("Error creating affiliate:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create affiliate" },
      { status: 500 }
    );
  }
}
